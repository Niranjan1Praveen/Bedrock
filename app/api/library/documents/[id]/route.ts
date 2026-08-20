import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { unauthorized } from "@/lib/auth";
import { deleteStorageObjects, getDocument } from "@/lib/library";

/** Rename, or record the page count once the viewer has read it. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, pageCount } = (body ?? {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (typeof title === "string" && title.trim()) data.title = title.trim();
  if (typeof pageCount === "number" && pageCount > 0) data.pageCount = pageCount;

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.document.update({ where: { id }, data });
  revalidatePath(`/admin/library/${doc.topic.subject.slug}`);
  return Response.json({ document: updated });
}

/** Removes the row and the object together, so neither is left orphaned. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.document.delete({ where: { id } });
  // Row first: an orphaned object is invisible and cheap, whereas a row
  // pointing at a missing object shows up as a broken entry in the listing.
  await deleteStorageObjects([doc.storagePath]).catch(() => {});

  revalidatePath("/admin/library");
  revalidatePath(`/admin/library/${doc.topic.subject.slug}`);
  return Response.json({ ok: true });
}
