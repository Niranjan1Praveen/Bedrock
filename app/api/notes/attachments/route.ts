import { prisma } from "@/lib/prisma";
import {
  badJson,
  noteImagePrefix,
  noteUserId,
  notFound,
  readJson,
  removeNoteObjects,
  unauthenticated,
} from "@/lib/notes";
import {
  cleanUrl,
  IMAGE_TYPES,
  MAX_ATTACHMENTS,
  MAX_IMAGE_BYTES,
  MAX_LABEL,
} from "@/lib/note-limits";

/** A label from the caller, or a fallback, trimmed to length. */
function labelOf(value: unknown, fallback: string) {
  const label = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return (label || fallback).slice(0, MAX_LABEL);
}

/**
 * Records a link, or an image whose bytes are already in storage.
 *
 * For an image this is called after the browser has finished uploading, so a
 * failed upload never gets a row and leaves nothing broken in the list.
 */
export async function POST(request: Request) {
  const userId = await noteUserId();
  if (!userId) return unauthenticated();

  const body = await readJson(request);
  if (!body) return badJson();

  const { entryId, kind } = body;
  if (typeof entryId !== "string" || !entryId) {
    return Response.json({ error: "entryId is required" }, { status: 400 });
  }

  const entry = await prisma.noteEntry.findFirst({ where: { id: entryId, userId } });
  if (!entry) return notFound();

  const position = await prisma.noteAttachment.count({ where: { entryId } });
  if (position >= MAX_ATTACHMENTS) {
    return Response.json(
      { error: `An entry holds at most ${MAX_ATTACHMENTS} attachments` },
      { status: 400 },
    );
  }

  if (kind === "link") {
    const url = cleanUrl(body.url);
    if (!url) {
      return Response.json(
        { error: "That is not a web address. Use one starting with http or https." },
        { status: 400 },
      );
    }
    const attachment = await prisma.noteAttachment.create({
      data: {
        userId,
        entryId,
        kind: "link",
        url,
        label: labelOf(body.label, url.replace(/^https?:\/\//, "").replace(/\/$/, "")),
        position,
      },
    });
    return Response.json({ attachment }, { status: 201 });
  }

  if (kind === "image") {
    const { storagePath, mimeType, sizeBytes } = body;
    if (
      typeof storagePath !== "string" ||
      !storagePath.startsWith(noteImagePrefix(userId, entryId)) ||
      storagePath.includes("..")
    ) {
      // Also what stops an object under someone else's prefix being attached.
      return Response.json({ error: "That image does not belong here" }, { status: 400 });
    }
    if (typeof mimeType !== "string" || !(mimeType in IMAGE_TYPES)) {
      return Response.json({ error: "Unsupported image type" }, { status: 415 });
    }
    if (typeof sizeBytes !== "number" || sizeBytes <= 0 || sizeBytes > MAX_IMAGE_BYTES) {
      return Response.json({ error: "Invalid image size" }, { status: 400 });
    }

    try {
      const attachment = await prisma.noteAttachment.create({
        data: {
          userId,
          entryId,
          kind: "image",
          storagePath,
          mimeType,
          sizeBytes,
          label: labelOf(body.label, "Image"),
          position,
        },
      });
      return Response.json({ attachment }, { status: 201 });
    } catch {
      // The bytes are already in the bucket; with no row nothing can reach
      // them, so remove the object rather than strand it.
      await removeNoteObjects([storagePath]).catch(() => {});
      return Response.json({ error: "Could not save that image" }, { status: 500 });
    }
  }

  return Response.json({ error: "kind must be link or image" }, { status: 400 });
}
