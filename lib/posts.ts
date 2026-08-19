import { prisma } from "@/lib/prisma";
import type { Post, Tag } from "@/generated/prisma/client";

/**
 * The only door between pages and the posts table, mirroring lib/content.ts.
 *
 * Public pages call these directly from their Server Components rather than
 * fetching /api/posts over HTTP: same data, one less network hop. The API
 * exists for anything outside this app.
 */

export type PostWithTags = Post & { tags: Tag[] };

const published = { status: "PUBLISHED" as const };

export async function getPublishedPosts(): Promise<PostWithTags[]> {
  return prisma.post.findMany({
    where: published,
    orderBy: { publishedAt: "desc" },
    include: { tags: true },
  });
}

export async function getLatestPosts(take = 3): Promise<PostWithTags[]> {
  return prisma.post.findMany({
    where: published,
    orderBy: { publishedAt: "desc" },
    include: { tags: true },
    take,
  });
}

/**
 * A draft is reachable at its own URL while signed in, so a post can be
 * previewed in place before it goes public. It never appears in any listing.
 */
export async function getPostBySlug(
  slug: string,
  { includeDrafts = false } = {},
): Promise<PostWithTags | null> {
  return prisma.post.findFirst({
    where: includeDrafts ? { slug } : { slug, ...published },
    include: { tags: true },
  });
}

export async function getPostsByTag(tagSlug: string): Promise<PostWithTags[]> {
  return prisma.post.findMany({
    where: { ...published, tags: { some: { slug: tagSlug } } },
    orderBy: { publishedAt: "desc" },
    include: { tags: true },
  });
}

/** Tags that have at least one published post, with counts. */
export async function getTagsInUse(): Promise<
  { name: string; slug: string; count: number }[]
> {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: { where: published } } } },
    orderBy: { name: "asc" },
  });
  return tags
    .filter((t) => t._count.posts > 0)
    .map((t) => ({ name: t.name, slug: t.slug, count: t._count.posts }));
}

/** Every post including drafts. Admin only. */
export async function getAllPosts(): Promise<PostWithTags[]> {
  return prisma.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    include: { tags: true },
  });
}

/** Formats a date the same way everywhere it is shown. */
export function formatDate(date: Date | string | null): string {
  if (!date) return "Unpublished";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
