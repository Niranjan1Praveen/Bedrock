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
 * Regenerated a minute at a time.
 *
 * Publishing from a local dev server calls revalidatePath on *that* server, so
 * the deployed instance -- a separate Next process with its own cache pointing
 * at the same database -- never hears about it and keeps serving its cached
 * copy. An hour of that is too long to look like anything but a bug. A minute
 * bounds it, and costs one query per page per minute only when somebody asks
 * for the page.
 *
 * Publishing from the deployed admin still revalidates instantly, and is the
 * better habit; this is the safety net for when it is done from localhost.
 */
export const revalidate = 60;

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
