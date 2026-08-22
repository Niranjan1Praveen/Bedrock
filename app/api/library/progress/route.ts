import { revalidatePath } from "next/cache";
import { getUser, unauthorized } from "@/lib/auth";
import { setRevised, setTopicRevised } from "@/lib/library";
import { prisma } from "@/lib/prisma";

/**
 * Marks a document, or a whole topic, as revised for the signed-in user.
 *
 * The user id comes from the verified session claim, never from the request
 * body: accepting a userId from the client would let any account write another
 * account's progress.
 */
export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;

  const user = await getUser();
  const userId = typeof user?.sub === "string" ? user.sub : null;
  if (!userId) {
    return Response.json({ error: "No user id on the session" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { documentId, topicId, revised } = (body ?? {}) as Record<string, unknown>;
  if (typeof revised !== "boolean") {
    return Response.json({ error: "revised must be a boolean" }, { status: 400 });
  }

  if (typeof documentId === "string" && documentId) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { topic: { include: { subject: true } } },
    });
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    await setRevised(userId, documentId, revised);
    revalidatePath(`/admin/library/${doc.topic.subject.slug}`);
    revalidatePath("/admin/library");
    revalidatePath("/admin");
    return Response.json({ ok: true, revised });
  }

  if (typeof topicId === "string" && topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { subject: true },
    });
    if (!topic) return Response.json({ error: "Not found" }, { status: 404 });

    const affected = await setTopicRevised(userId, topicId, revised);
    revalidatePath(`/admin/library/${topic.subject.slug}`);
    revalidatePath("/admin/library");
    revalidatePath("/admin");
    return Response.json({ ok: true, revised, affected });
  }

  return Response.json(
    { error: "Supply either documentId or topicId" },
    { status: 400 },
  );
}
