import { prisma } from "@/lib/prisma";
import {
  createAdminClient,
  LIBRARY_BUCKET,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/supabase/admin";
import { slugify } from "@/lib/markdown";
import { extensionOf, kindOf } from "@/lib/file-types";

export { formatBytes } from "@/lib/format";

/**
 * The library: subjects, their topics, and the PDFs inside them.
 *
 * Files are never public. A row stores only the object key inside the private
 * `library` bucket, and every read goes through a signed URL minted here after
 * the caller's session has been checked.
 */

export async function getSubjects() {
  const subjects = await prisma.subject.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: {
      topics: {
        select: { id: true, _count: { select: { documents: true } } },
      },
    },
  });

  return subjects.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    topicCount: s.topics.length,
    documentCount: s.topics.reduce((n, t) => n + t._count.documents, 0),
  }));
}

export async function getSubjectBySlug(slug: string) {
  return prisma.subject.findUnique({
    where: { slug },
    include: {
      topics: {
        orderBy: [{ position: "asc" }, { name: "asc" }],
        include: {
          documents: {
            orderBy: [{ position: "asc" }, { title: "asc" }],
          },
        },
      },
    },
  });
}

export type SubjectWithTopics = NonNullable<
  Awaited<ReturnType<typeof getSubjectBySlug>>
>;

export async function getDocument(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: { topic: { include: { subject: true } } },
  });
}

/** Everything the upload form needs to offer existing subjects and topics. */
export async function getLibraryTree() {
  return prisma.subject.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      topics: {
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

/**
 * A time-limited URL for reading one object.
 *
 * The bucket is private, so this is the only way to see a file, and the link
 * stops working roughly an hour after it is issued.
 */
export async function signedReadUrl(storagePath: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(LIBRARY_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not sign that file");
  }
  return data.signedUrl;
}

/**
 * A one-shot upload ticket, so the browser sends the file straight to storage.
 *
 * This matters more than it looks: a serverless function on Vercel caps a
 * request body at about 4.5MB, so routing a 30MB PDF through an API route
 * would fail in production while working locally. The file never touches our
 * server.
 */
export async function signedUploadUrl(storagePath: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(LIBRARY_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create an upload ticket");
  }
  return { path: data.path, token: data.token };
}

export async function deleteStorageObjects(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(LIBRARY_BUCKET).remove(paths);
  if (error) throw new Error(error.message);
}

/**
 * Builds the object key for a file.
 *
 * Includes a random suffix so two uploads of `unit-1.pdf` into the same topic
 * cannot collide, and so the key cannot be guessed from the title. The real
 * extension is preserved, which is what lets the viewer pick a renderer even
 * for rows written before mimeType existed.
 */
export function buildStoragePath(
  subjectSlug: string,
  topicSlug: string,
  fileName: string,
  reportedType?: string | null,
) {
  const ext = extensionOf(fileName, reportedType);
  const base =
    slugify(fileName.replace(/\.(pdf|docx|pptx)$/i, "")) || "document";
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${subjectSlug}/${topicSlug}/${base}-${suffix}${ext}`;
}

/** Ensures a subject exists, by slug, and returns it. */
export async function upsertSubject(name: string) {
  const slug = slugify(name);
  if (!slug) throw new Error("That subject name has no usable slug");
  return prisma.subject.upsert({
    where: { slug },
    update: {},
    create: { slug, name: name.trim() },
  });
}

/** Ensures a topic exists inside a subject, by slug, and returns it. */
export async function upsertTopic(subjectId: string, name: string) {
  const slug = slugify(name);
  if (!slug) throw new Error("That topic name has no usable slug");
  return prisma.topic.upsert({
    where: { subjectId_slug: { subjectId, slug } },
    update: {},
    create: { slug, name: name.trim(), subjectId },
  });
}

/* ------------------------------------------------------------------ *
 * Per-user revision progress
 *
 * Progress belongs to one account and is never read across accounts:
 * every query below is filtered by userId, so the three people with
 * logins each see only their own state. A missing row means "not
 * revised", which keeps the table proportional to what has actually
 * been read rather than to the whole library.
 * ------------------------------------------------------------------ */

/** Document ids this user has marked, limited to the ids asked about. */
async function revisedIds(userId: string, documentIds: string[]) {
  if (documentIds.length === 0) return new Set<string>();
  const rows = await prisma.documentProgress.findMany({
    where: { userId, documentId: { in: documentIds } },
    select: { documentId: true },
  });
  return new Set(rows.map((r) => r.documentId));
}

export interface SubjectCard {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  topicCount: number;
  documentCount: number;
  revisedCount: number;
  /// Carried to the client so the index can be searched by topic without a
  /// request. Names only, which stays small even as topics accumulate.
  topicNames: string[];
}

export async function getSubjectsWithProgress(
  userId: string,
): Promise<SubjectCard[]> {
  const subjects = await prisma.subject.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: {
      topics: {
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: { name: true, documents: { select: { id: true } } },
      },
    },
  });

  const allIds = subjects.flatMap((s) =>
    s.topics.flatMap((t) => t.documents.map((d) => d.id)),
  );
  const revised = await revisedIds(userId, allIds);

  return subjects.map((s) => {
    const ids = s.topics.flatMap((t) => t.documents.map((d) => d.id));
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      imageUrl: s.imageUrl,
      topicCount: s.topics.length,
      documentCount: ids.length,
      revisedCount: ids.filter((id) => revised.has(id)).length,
      topicNames: s.topics.map((t) => t.name),
    };
  });
}

export async function getSubjectWithProgress(slug: string, userId: string) {
  const subject = await getSubjectBySlug(slug);
  if (!subject) return null;

  const ids = subject.topics.flatMap((t) => t.documents.map((d) => d.id));
  const revised = await revisedIds(userId, ids);

  const topics = subject.topics.map((t) => {
    const documents = t.documents.map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      sizeBytes: d.sizeBytes,
      pageCount: d.pageCount,
      revised: revised.has(d.id),
      // Resolved here so the client never needs the storage path.
      kind: kindOf(d.mimeType, d.storagePath),
    }));
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      documents,
      revisedCount: documents.filter((d) => d.revised).length,
    };
  });

  return {
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    imageUrl: subject.imageUrl,
    topics,
    documentCount: ids.length,
    revisedCount: ids.filter((id) => revised.has(id)).length,
  };
}

export async function isRevised(userId: string, documentId: string) {
  const row = await prisma.documentProgress.findUnique({
    where: { userId_documentId: { userId, documentId } },
  });
  return Boolean(row);
}

/** Marking is an upsert; unmarking is a delete, so absence means not revised. */
export async function setRevised(
  userId: string,
  documentId: string,
  revised: boolean,
) {
  if (revised) {
    await prisma.documentProgress.upsert({
      where: { userId_documentId: { userId, documentId } },
      update: {},
      create: { userId, documentId },
    });
  } else {
    await prisma.documentProgress
      .delete({ where: { userId_documentId: { userId, documentId } } })
      .catch(() => {
        // Already absent, which is the state the caller wanted.
      });
  }
}

/** Marks or unmarks every document in one topic at once. */
export async function setTopicRevised(
  userId: string,
  topicId: string,
  revised: boolean,
) {
  const docs = await prisma.document.findMany({
    where: { topicId },
    select: { id: true },
  });
  const ids = docs.map((d) => d.id);
  if (ids.length === 0) return 0;

  if (revised) {
    await prisma.documentProgress.createMany({
      data: ids.map((documentId) => ({ userId, documentId })),
      skipDuplicates: true,
    });
  } else {
    await prisma.documentProgress.deleteMany({
      where: { userId, documentId: { in: ids } },
    });
  }
  return ids.length;
}

/** Figures for the admin overview. */
export async function getLibraryStats(userId: string) {
  const [subjects, topics, documents, revised, bytes] = await Promise.all([
    prisma.subject.count(),
    prisma.topic.count(),
    prisma.document.count(),
    prisma.documentProgress.count({ where: { userId } }),
    prisma.document.aggregate({ _sum: { sizeBytes: true } }),
  ]);
  return {
    subjects,
    topics,
    documents,
    revised,
    totalBytes: bytes._sum.sizeBytes ?? 0,
  };
}

/** Most recently uploaded documents, for the overview's activity list. */
export async function getRecentDocuments(take = 5) {
  return prisma.document.findMany({
    orderBy: { uploadedAt: "desc" },
    take,
    include: { topic: { include: { subject: true } } },
  });
}

/** Sets or clears a subject's cover image. */
export async function setSubjectImage(slug: string, imageUrl: string | null) {
  return prisma.subject.update({ where: { slug }, data: { imageUrl } });
}
