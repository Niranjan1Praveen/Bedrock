import { prisma } from "@/lib/prisma";
import { unauthorized, getUser } from "@/lib/auth";
import { readingTime, slugify } from "@/lib/markdown";
import { revalidateBlog, toTagConnect } from "../route";

/** A draft is only readable while signed in. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { tags: true },
  });

  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  if (post.status !== "PUBLISHED" && !(await getUser())) {
    // 404 rather than 401, so an unpublished slug is not confirmed to exist.
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ post });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { slug } = await params;
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = (body ?? {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (typeof patch.title === "string" && patch.title.trim()) {
    data.title = patch.title.trim();
  }
  if (typeof patch.content === "string") {
    data.content = patch.content;
    data.readingTime = readingTime(patch.content);
  }
  if (typeof patch.summary === "string") {
    data.summary = patch.summary.trim() || null;
  }
  if (typeof patch.coverImage === "string") {
    data.coverImage = patch.coverImage || null;
  }

  // Changing a slug breaks every existing link to the post, so it is allowed
  // but never silent: the old path is revalidated too.
  let newSlug: string | undefined;
  if (typeof patch.slug === "string" && patch.slug.trim()) {
    const candidate = slugify(patch.slug);
    if (candidate && candidate !== slug) {
      const clash = await prisma.post.findUnique({ where: { slug: candidate } });
      if (clash) {
        return Response.json(
          { error: `A post already uses the slug "${candidate}"` },
          { status: 409 },
        );
      }
      data.slug = candidate;
      newSlug = candidate;
    }
  }

  if (patch.status === "PUBLISHED" || patch.status === "DRAFT") {
    data.status = patch.status;
    // publishedAt is the date the post went public and is set exactly once.
    // Re-publishing something previously published keeps its original date.
    if (patch.status === "PUBLISHED" && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
  }

  if (Array.isArray(patch.tags)) {
    data.tags = { set: [], connectOrCreate: toTagConnect(patch.tags) };
  }

  const post = await prisma.post.update({
    where: { slug },
    data,
    include: { tags: true },
  });

  revalidateBlog(slug);
  if (newSlug) revalidateBlog(newSlug);

  return Response.json({ post });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { slug } = await params;
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.post.delete({ where: { slug } });
  revalidateBlog(slug);

  return Response.json({ ok: true });
}
