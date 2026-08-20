import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";
import { deleteStorageObjects } from "@/lib/library";
import { slugify } from "@/lib/markdown";

/**
 * Records documents whose bytes are already in storage.
 *
 * Called after the browser has finished uploading, so a failed upload simply
 * never gets a row and leaves nothing dangling in the listing.
 */
export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;
  const user = await getUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topicId, documents } = (body ?? {}) as {
    topicId?: unknown;
    documents?: unknown;
  };

  if (typeof topicId !== "string" || !topicId) {
    return Response.json({ error: "topicId is required" }, { status: 400 });
  }
  if (!Array.isArray(documents) || documents.length === 0) {
    return Response.json({ error: "No documents supplied" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { subject: true },
  });
  if (!topic) {
    return Response.json({ error: "Unknown topic" }, { status: 404 });
  }

  const existing = await prisma.document.count({ where: { topicId } });

  const created = [];
  const orphaned: string[] = [];

  for (const [i, d] of documents.entries()) {
    const { title, storagePath, sizeBytes } = (d ?? {}) as Record<string, unknown>;
    if (
      typeof title !== "string" ||
      typeof storagePath !== "string" ||
      typeof sizeBytes !== "number"
    ) {
      continue;
    }

    // Slugs are unique per topic; a repeat upload of the same title gets a
    // numbered suffix rather than failing the whole batch.
    const base = slugify(title.replace(/\.pdf$/i, "")) || "document";
    let slug = base;
    let n = 1;
    while (await prisma.document.findUnique({ where: { topicId_slug: { topicId, slug } } })) {
      slug = `${base}-${++n}`;
    }

    try {
      created.push(
        await prisma.document.create({
          data: {
            title: title.replace(/\.pdf$/i, "").trim() || "Untitled",
            slug,
            storagePath,
            sizeBytes,
            topicId,
            position: existing + i,
            uploadedBy: typeof user?.sub === "string" ? user.sub : null,
          },
        }),
      );
    } catch {
      // The bytes are already in the bucket; without a row nothing can ever
      // reach them, so remove the object rather than leave it stranded.
      orphaned.push(storagePath);
    }
  }

  await deleteStorageObjects(orphaned).catch(() => {});

  revalidatePath("/admin/library");
  revalidatePath(`/admin/library/${topic.subject.slug}`);

  return Response.json({ created: created.length, failed: orphaned.length }, { status: 201 });
}
