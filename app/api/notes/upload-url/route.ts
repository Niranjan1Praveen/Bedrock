import { prisma } from "@/lib/prisma";
import {
  badJson,
  noteImagePath,
  noteUserId,
  notFound,
  readJson,
  signedNoteUpload,
  unauthenticated,
} from "@/lib/notes";
import {
  IMAGE_TYPES,
  MAX_ATTACHMENTS,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_BATCH,
} from "@/lib/note-limits";

/**
 * Mints upload tickets for images going onto one entry.
 *
 * The browser then sends each file straight to storage, so no image passes
 * through this route -- a serverless function's request body is capped near
 * 4.5MB, and a screenshot can be more than that.
 */
export async function POST(request: Request) {
  const userId = await noteUserId();
  if (!userId) return unauthenticated();

  const body = await readJson(request);
  if (!body) return badJson();

  const { entryId, files } = body;
  if (typeof entryId !== "string" || !entryId) {
    return Response.json({ error: "entryId is required" }, { status: 400 });
  }
  if (!Array.isArray(files) || files.length === 0) {
    return Response.json({ error: "No files listed" }, { status: 400 });
  }
  if (files.length > MAX_IMAGES_PER_BATCH) {
    return Response.json(
      { error: `${MAX_IMAGES_PER_BATCH} images at a time is the limit` },
      { status: 400 },
    );
  }

  // The ownership check: an entry that is not this account's is not found.
  const entry = await prisma.noteEntry.findFirst({ where: { id: entryId, userId } });
  if (!entry) return notFound();

  const existing = await prisma.noteAttachment.count({ where: { entryId } });
  if (existing + files.length > MAX_ATTACHMENTS) {
    return Response.json(
      { error: `An entry holds at most ${MAX_ATTACHMENTS} attachments` },
      { status: 400 },
    );
  }

  // Validate everything before minting anything.
  const wanted: { name: string; size: number; type: string }[] = [];
  for (const f of files) {
    const { name, size, type } = (f ?? {}) as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "A file is missing its name" }, { status: 400 });
    }
    if (typeof type !== "string" || !(type in IMAGE_TYPES)) {
      return Response.json(
        { error: `${name} is not a PNG, JPEG, WebP or GIF image` },
        { status: 415 },
      );
    }
    if (typeof size !== "number" || size <= 0) {
      return Response.json({ error: `${name} has no size` }, { status: 400 });
    }
    if (size > MAX_IMAGE_BYTES) {
      return Response.json(
        { error: `${name} is ${(size / 1048576).toFixed(1)}MB; the limit is 8MB` },
        { status: 413 },
      );
    }
    wanted.push({ name, size, type });
  }

  const tickets = await Promise.all(
    wanted.map(async (f) => {
      const path = noteImagePath(userId, entryId, IMAGE_TYPES[f.type]);
      const { token } = await signedNoteUpload(path);
      return { name: f.name, size: f.size, mime: f.type, path, token };
    }),
  );

  return Response.json({ tickets });
}
