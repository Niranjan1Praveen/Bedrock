import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { unauthorized } from "@/lib/auth";
import { readingTime, slugify } from "@/lib/markdown";
import { getPublishedPosts } from "@/lib/posts";

/** Published posts as JSON. Public, and never includes drafts. */
export async function GET() {
  const posts = await getPublishedPosts();
  return Response.json({
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      publishedAt: p.publishedAt,
      readingTime: p.readingTime,
      tags: p.tags.map((t) => t.slug),
    })),
  });
}

/**
 * Create a post.
 *
 * The proxy already redirects signed-out browsers, but it is an optimistic
 * check only, so authorization is re-established here before anything is read
 * from the body.
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

  const { title, slug, summary, content, coverImage, tags, status } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof title !== "string" || !title.trim()) {
    return Response.json({ error: "A title is required" }, { status: 400 });
  }
  if (typeof content !== "string") {
    return Response.json({ error: "Content must be a string" }, { status: 400 });
  }

  const finalSlug =
    typeof slug === "string" && slug.trim() ? slugify(slug) : slugify(title);
  if (!finalSlug) {
    return Response.json(
      { error: "Could not derive a slug from that title" },
      { status: 400 },
    );
  }

  const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
  if (existing) {
    return Response.json(
      { error: `A post already uses the slug "${finalSlug}"` },
      { status: 409 },
    );
  }

  const publish = status === "PUBLISHED";

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      slug: finalSlug,
      summary: typeof summary === "string" ? summary.trim() || null : null,
      content,
      coverImage: typeof coverImage === "string" ? coverImage || null : null,
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? new Date() : null,
      readingTime: readingTime(content),
      tags: { connectOrCreate: toTagConnect(tags) },
    },
    include: { tags: true },
  });

  revalidateBlog(post.slug);
  return Response.json({ post }, { status: 201 });
}

/** Accepts tag names, stores them slugified, and reuses existing rows. */
export function toTagConnect(tags: unknown) {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .map((name) => ({
      where: { slug: slugify(name) },
      create: { name: name.trim(), slug: slugify(name) },
    }))
    .filter((t) => t.where.slug.length > 0);
}

/** A published post changes three surfaces: its page, the index, the homepage. */
export function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/");
  if (slug) revalidatePath(`/blog/${slug}`);
}
