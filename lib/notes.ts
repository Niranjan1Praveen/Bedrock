import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import {
  createAdminClient,
  NOTES_BUCKET,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/supabase/admin";
import { slugify } from "@/lib/markdown";

/**
 * Personal notes: a title, the entries inside it, and what is attached to each.
 *
 * Every read and write here takes a userId and puts it in the `where`. Nothing
 * in this file looks a row up by id alone, so a route cannot forget the check:
 * someone else's id simply finds nothing. Images are never public -- a row
 * keeps only the object key, and a signed URL is minted for each view.
 */

/** The signed-in account's id, or null. What every notes route starts from. */
export async function noteUserId(): Promise<string | null> {
  const user = await getUser();
  return typeof user?.sub === "string" ? user.sub : null;
}

/** The request body as an object, or null if it is not one. */
export async function readJson(request: Request) {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export const unauthenticated = () =>
  Response.json({ error: "Unauthorized" }, { status: 401 });
export const badJson = () =>
  Response.json({ error: "Invalid JSON" }, { status: 400 });
export const notFound = () =>
  Response.json({ error: "Not found" }, { status: 404 });

/* ------------------------------------------------------------------ *
 * Reading
 * ------------------------------------------------------------------ */

export async function listNoteTopics(userId: string) {
  const topics = await prisma.noteTopic.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { entries: true } } },
  });
  return topics.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    entryCount: t._count.entries,
    updatedAt: t.updatedAt,
  }));
}

const entryInclude = {
  attachments: { orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }] },
};

/** A topic with every entry and attachment in it, images already signed. */
export async function getNoteTopic(userId: string, slug: string) {
  const topic = await prisma.noteTopic.findUnique({
    where: { userId_slug: { userId, slug } },
    include: {
      entries: {
        where: { userId },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        include: entryInclude,
      },
    },
  });
  if (!topic) return null;

  const urls = await signImages(
    topic.entries.flatMap((e) => e.attachments.map((a) => a.storagePath)),
  );
  return {
    ...topic,
    entries: topic.entries.map((e) => ({
      ...e,
      attachments: e.attachments.map((a) => ({
        ...a,
        imageUrl: a.storagePath ? (urls.get(a.storagePath) ?? null) : null,
      })),
    })),
  };
}

export type NoteTopicView = NonNullable<Awaited<ReturnType<typeof getNoteTopic>>>;
export type NoteEntryView = NoteTopicView["entries"][number];

export async function getNoteEntry(
  userId: string,
  topicSlug: string,
  entrySlug: string,
) {
  const topic = await getNoteTopic(userId, topicSlug);
  const entry = topic?.entries.find((e) => e.slug === entrySlug);
  return topic && entry ? { topic, entry } : null;
}

/* ------------------------------------------------------------------ *
 * Creating
 * ------------------------------------------------------------------ */

/** The base slug, or the first `base-2`, `base-3`... that is not taken. */
async function freeSlug(
  base: string,
  taken: (slug: string) => Promise<boolean>,
) {
  let slug = base;
  for (let n = 2; await taken(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export async function createNoteTopic(userId: string, title: string) {
  const base = slugify(title) || "untitled";
  const slug = await freeSlug(
    base,
    async (s) =>
      Boolean(await prisma.noteTopic.findUnique({ where: { userId_slug: { userId, slug: s } } })),
  );
  const position = await prisma.noteTopic.count({ where: { userId } });
  return prisma.noteTopic.create({ data: { userId, slug, title, position } });
}

/** Null when the topic is not this user's. */
export async function createNoteEntry(
  userId: string,
  topicId: string,
  title: string,
) {
  const topic = await prisma.noteTopic.findFirst({ where: { id: topicId, userId } });
  if (!topic) return null;

  const base = slugify(title) || "untitled";
  const slug = await freeSlug(
    base,
    async (s) =>
      Boolean(await prisma.noteEntry.findUnique({ where: { topicId_slug: { topicId, slug: s } } })),
  );
  const position = await prisma.noteEntry.count({ where: { topicId } });
  const entry = await prisma.noteEntry.create({
    data: { userId, topicId, slug, title, position },
  });
  return { topic, entry };
}

/* ------------------------------------------------------------------ *
 * Images
 * ------------------------------------------------------------------ */

/** Signed read URLs for a set of object keys, in one call. */
async function signImages(paths: (string | null)[]) {
  const wanted = paths.filter((p): p is string => Boolean(p));
  const urls = new Map<string, string>();
  if (wanted.length === 0) return urls;

  const { data, error } = await createAdminClient()
    .storage.from(NOTES_BUCKET)
    .createSignedUrls(wanted, SIGNED_URL_TTL_SECONDS);
  if (error) throw new Error(error.message);

  for (const item of data ?? []) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }
  return urls;
}

/** A one-shot upload ticket, so the browser sends the file straight to storage. */
export async function signedNoteUpload(path: string) {
  const { data, error } = await createAdminClient()
    .storage.from(NOTES_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(error?.message ?? "Could not create an upload ticket");
  }
  return { path: data.path, token: data.token };
}

export async function removeNoteObjects(paths: (string | null)[]) {
  const wanted = paths.filter((p): p is string => Boolean(p));
  if (wanted.length === 0) return;
  const { error } = await createAdminClient()
    .storage.from(NOTES_BUCKET)
    .remove(wanted);
  if (error) throw new Error(error.message);
}

/**
 * The key an image is stored under.
 *
 * Starts with the account and the entry, so an object's path alone says whose
 * it is -- which is also what the attachment route checks before it records
 * one, so a path belonging to someone else cannot be attached here.
 */
export function noteImagePath(userId: string, entryId: string, extension: string) {
  return `${userId}/${entryId}/${crypto.randomUUID()}${extension}`;
}

export function noteImagePrefix(userId: string, entryId: string) {
  return `${userId}/${entryId}/`;
}

/** Object keys of every image under a topic or an entry, for cleaning up. */
export async function imagePathsForTopic(userId: string, topicId: string) {
  const rows = await prisma.noteAttachment.findMany({
    where: { userId, entry: { topicId }, storagePath: { not: null } },
    select: { storagePath: true },
  });
  return rows.map((r) => r.storagePath);
}

export async function imagePathsForEntry(userId: string, entryId: string) {
  const rows = await prisma.noteAttachment.findMany({
    where: { userId, entryId, storagePath: { not: null } },
    select: { storagePath: true },
  });
  return rows.map((r) => r.storagePath);
}
