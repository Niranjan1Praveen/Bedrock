import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { PostList } from "@/components/blog/post-list";
import { getPostsByTag, getTagsInUse } from "@/lib/posts";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getTagsInUse()).map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  return { title: `Posts tagged ${tag}` };
}

export default async function TagPage({ params }: PageProps<"/blog/tags/[tag]">) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  return (
    <Container className="py-16 sm:py-24">
      <MonoLabel>Tagged</MonoLabel>
      <h1 className="mt-4 text-3xl sm:text-4xl">{tag}</h1>
      <Link
        href="/blog"
        className="mono-label text-ink-subtle hover:text-ink mt-5 inline-block transition-colors"
      >
        &larr; All posts
      </Link>
      <div className="mt-12">
        <PostList posts={posts} />
      </div>
    </Container>
  );
}
