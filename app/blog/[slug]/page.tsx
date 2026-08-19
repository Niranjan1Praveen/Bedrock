import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import { getUser } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate, getPostBySlug, getPublishedPosts } from "@/lib/posts";

export const revalidate = 3600;

/** Published posts are prerendered; a draft falls through to on-demand. */
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.summary ?? undefined,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;

  // A draft is readable at its own URL while signed in, so a post can be
  // checked in place before it goes public. getUser() makes this route
  // dynamic for a signed-in visitor and cached for everyone else.
  const signedIn = Boolean(await getUser());
  const post = await getPostBySlug(slug, { includeDrafts: signedIn });
  if (!post) notFound();

  const html = await renderMarkdown(post.content);

  return (
    <Container className="py-12 sm:py-16">
      <nav className="mono-label text-ink-subtle">
        <Link href="/blog" className="hover:text-ink transition-colors">
          Blog
        </Link>
      </nav>

      <header className="mt-6 max-w-3xl">
        {post.status !== "PUBLISHED" && (
          <Pill tone="warn" className="mb-5">
            Draft, visible only to you
          </Pill>
        )}

        <h1 className="text-3xl sm:text-4xl">{post.title}</h1>

        <div className="text-ink-subtle mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <MonoLabel>{formatDate(post.publishedAt)}</MonoLabel>
          <MonoLabel>{post.readingTime} min read</MonoLabel>
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog/tags/${tag.slug}`}
              className="mono-label border-line hover:border-ink-subtle hover:text-ink rounded-full border px-2.5 py-1 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        {post.summary && (
          <p className="text-ink-muted mt-7 text-lg leading-relaxed">
            {post.summary}
          </p>
        )}
      </header>

      {post.coverImage && (
        // Plain img: the URL is a Supabase Storage host that next/image would
        // need configuring for, and these are already sized for the web.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="border-line mt-10 w-full rounded-xl border"
        />
      )}

      <article
        className="prose mt-12"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="border-line mt-16 border-t pt-8">
        <Link
          href="/blog"
          className="mono-label text-ink-subtle hover:text-ink transition-colors"
        >
          &larr; All posts
        </Link>
      </footer>
    </Container>
  );
}
