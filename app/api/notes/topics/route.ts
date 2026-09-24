import {
  badJson,
  createNoteTopic,
  noteUserId,
  readJson,
  unauthenticated,
} from "@/lib/notes";
import { cleanTitle, MAX_TITLE } from "@/lib/note-limits";

/** Starts a new title. */
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

  const topic = await createNoteTopic(userId, title);
  return Response.json({ topic }, { status: 201 });
}
