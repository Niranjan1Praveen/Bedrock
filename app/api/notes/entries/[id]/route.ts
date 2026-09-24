import { prisma } from "@/lib/prisma";
import {
  badJson,
  imagePathsForEntry,
  noteUserId,
  notFound,
  readJson,
  removeNoteObjects,
  unauthenticated,
} from "@/lib/notes";
import { cleanTitle, MAX_BODY, MAX_TITLE } from "@/lib/note-limits";

/** Saves an entry's title, its text, or both. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await noteUserId();
  if (!userId) return unauthenticated();

  const input = await readJson(request);
  if (!input) return badJson();

  const data: { title?: string; body?: string } = {};

  if ("title" in input) {
    const title = cleanTitle(input.title);
    if (!title) {
      return Response.json(
        { error: `A title of 1 to ${MAX_TITLE} characters is required` },
        { status: 400 },
      );
    }
    data.title = title;
  }

  if ("body" in input) {
    if (typeof input.body !== "string" || input.body.length > MAX_BODY) {
      return Response.json(
        { error: `The text can be at most ${MAX_BODY.toLocaleString()} characters` },
        { status: 400 },
      );
    }
    data.body = input.body;
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { id } = await params;
  const { count } = await prisma.noteEntry.updateMany({
    where: { id, userId },
    data,
  });
  if (count === 0) return notFound();
  return Response.json({ ok: true });
}

/** Removes an entry and its images. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await noteUserId();
  if (!userId) return unauthenticated();

  const { id } = await params;
  const paths = await imagePathsForEntry(userId, id);

  const { count } = await prisma.noteEntry.deleteMany({ where: { id, userId } });
  if (count === 0) return notFound();

  await removeNoteObjects(paths).catch(() => {});
  return Response.json({ ok: true });
}
