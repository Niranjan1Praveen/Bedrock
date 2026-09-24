import { prisma } from "@/lib/prisma";
import {
  noteUserId,
  notFound,
  removeNoteObjects,
  unauthenticated,
} from "@/lib/notes";

/** Removes one link or image. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await noteUserId();
  if (!userId) return unauthenticated();

  const { id } = await params;
  const found = await prisma.noteAttachment.findFirst({
    where: { id, userId },
    select: { storagePath: true },
  });
  if (!found) return notFound();

  await prisma.noteAttachment.deleteMany({ where: { id, userId } });
  await removeNoteObjects([found.storagePath]).catch(() => {});
  return Response.json({ ok: true });
}
