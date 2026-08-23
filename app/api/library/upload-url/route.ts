import { unauthorized } from "@/lib/auth";
import {
  buildStoragePath,
  signedUploadUrl,
  upsertSubject,
  upsertTopic,
} from "@/lib/library";
import { isAccepted, mimeOf } from "@/lib/file-types";

const MAX_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 25;

/**
 * Mints upload tickets for a batch of PDFs, creating the subject and topic if
 * they are new.
 *
 * The browser uploads straight to Supabase Storage with these tickets. Nothing
 * larger than a few kilobytes ever passes through this route, which is what
 * makes 50MB files possible at all: a serverless function request body is
 * capped near 4.5MB.
 */
export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { subject, topic, files } = (body ?? {}) as {
    subject?: unknown;
    topic?: unknown;
    files?: unknown;
  };

  if (typeof subject !== "string" || !subject.trim()) {
    return Response.json({ error: "A subject is required" }, { status: 400 });
  }
  if (typeof topic !== "string" || !topic.trim()) {
    return Response.json({ error: "A topic is required" }, { status: 400 });
  }
  if (!Array.isArray(files) || files.length === 0) {
    return Response.json({ error: "No files listed" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return Response.json(
      { error: `That is ${files.length} files; ${MAX_FILES} at a time is the limit` },
      { status: 400 },
    );
  }

  // Validate the whole batch before creating anything, so a bad file does not
  // leave a half-made subject behind.
  const wanted: { name: string; size: number; mime: string }[] = [];
  for (const f of files) {
    const { name, size, type } = (f ?? {}) as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "A file is missing its name" }, { status: 400 });
    }
    if (typeof size !== "number" || size <= 0) {
      return Response.json({ error: `${name} has no size` }, { status: 400 });
    }
    if (size > MAX_BYTES) {
      return Response.json(
        { error: `${name} is ${(size / 1048576).toFixed(1)}MB; the limit is 50MB` },
        { status: 413 },
      );
    }
    // The bucket restricts MIME types too, so this is the first of two checks.
    // Browsers report an empty or wrong type for Office files often enough
    // that the extension has to count as well.
    const reported = typeof type === "string" ? type : null;
    if (!isAccepted(reported, name)) {
      return Response.json(
        { error: `${name} is not a PDF, DOCX or PPTX` },
        { status: 415 },
      );
    }
    // Store the canonical type rather than whatever the browser guessed.
    wanted.push({ name, size, mime: mimeOf(name, reported) });
  }

  const subjectRow = await upsertSubject(subject);
  const topicRow = await upsertTopic(subjectRow.id, topic);

  const tickets = await Promise.all(
    wanted.map(async (f) => {
      const path = buildStoragePath(
        subjectRow.slug,
        topicRow.slug,
        f.name,
        f.mime,
      );
      const { token } = await signedUploadUrl(path);
      return { name: f.name, size: f.size, mime: f.mime, path, token };
    }),
  );

  return Response.json({
    subject: { id: subjectRow.id, slug: subjectRow.slug, name: subjectRow.name },
    topic: { id: topicRow.id, slug: topicRow.slug, name: topicRow.name },
    tickets,
  });
}
