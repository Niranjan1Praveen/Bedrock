import { prisma } from "@/lib/prisma";
import {
  badJson,
  imagePathsForTopic,
  noteUserId,
  notFound,
  readJson,
  removeNoteObjects,
  unauthenticated,
} from "@/lib/notes";
import { cleanTitle, MAX_TITLE } from "@/lib/note-limits";

/** Renames a title. The address stays as it was, so saved links keep working. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await noteUserId();
  if (!userId) return unauthenticated();

  const body = await readJson(request);
  if (!body) return badJson();

  const title = cleanTitle(body.title);
  if (!title) {
    return Response.json(
      { error: `A title of 1 to ${MAX_TITLE} characters is required` },
      { status: 400 },
    );
  }

  const { id } = await params;
  // updateMany because it takes the userId in its filter: someone else's id
  // matches nothing, where update() by id alone would not know to look.
  const { count } = await prisma.noteTopic.updateMany({
    where: { id, userId },
    data: { title },
  });
  if (count === 0) return notFound();
  return Response.json({ ok: true });
}

/** Removes a title, every entry in it, and their images. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await noteUserId();
  if (!userId) return unauthenticated();

  const { id } = await params;
  const paths = await imagePathsForTopic(userId, id);

  const { count } = await prisma.noteTopic.deleteMany({ where: { id, userId } });
  if (count === 0) return notFound();

  // Rows first: an orphaned object is invisible and cheap, whereas a row
  // pointing at a missing object shows up as a broken image.
  await removeNoteObjects(paths).catch(() => {});
  return Response.json({ ok: true });
}
