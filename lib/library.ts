import { prisma } from "@/lib/prisma";
import {
  createAdminClient,
  LIBRARY_BUCKET,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/supabase/admin";
import { slugify } from "@/lib/markdown";

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
 * cannot collide, and so the key cannot be guessed from the title.
 */
export function buildStoragePath(
  subjectSlug: string,
  topicSlug: string,
  fileName: string,
) {
  const base = slugify(fileName.replace(/\.pdf$/i, "")) || "document";
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${subjectSlug}/${topicSlug}/${base}-${suffix}.pdf`;
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
