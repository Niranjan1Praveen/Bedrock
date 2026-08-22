import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { PostList } from "@/components/blog/post-list";
import { getPublishedPosts, getTagsInUse } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing by Niranjan Praveen.",
};

/**
 * Regenerated on a timer and on publish.
 *
 * Serving from the cache is also what keeps the blog readable if the database
 * is unreachable: the free Supabase plan pauses a project after a week of
 * inactivity, and a cached page does not care.
 */
export const revalidate = 3600;

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([
    getPublishedPosts(),
    getTagsInUse(),
  ]);

  return (
    <Container className="py-16 sm:py-24">
      <MonoLabel>Blog</MonoLabel>
      <h1 className="mt-4 max-w-2xl text-3xl sm:text-4xl leading-snug">
        Experiences, stories and notes on things I have built and broken.
      </h1>

      {tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/blog/tags/${tag.slug}`}
              className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded-full border px-3 py-1.5 transition-colors"
            >
              {tag.name} {tag.count}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <PostList posts={posts} />
      </div>
    </Container>
  );
}
