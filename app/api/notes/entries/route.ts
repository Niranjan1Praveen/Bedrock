import {
  badJson,
  createNoteEntry,
  noteUserId,
  notFound,
  readJson,
  unauthenticated,
} from "@/lib/notes";
import { cleanTitle, MAX_TITLE } from "@/lib/note-limits";

/** Adds an entry to one of the caller's titles. */
export async function POST(request: Request) {
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
  if (typeof body.topicId !== "string" || !body.topicId) {
    return Response.json({ error: "topicId is required" }, { status: 400 });
  }

  const created = await createNoteEntry(userId, body.topicId, title);
  if (!created) return notFound();

  return Response.json(
    { entry: created.entry, topicSlug: created.topic.slug },
    { status: 201 },
  );
}
