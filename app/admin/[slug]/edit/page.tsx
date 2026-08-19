import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { getUser } from "@/lib/auth";
import { getPostBySlug } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: PageProps<"/admin/[slug]/edit">) {
  const { slug } = await params;
  if (!(await getUser())) redirect(`/login?next=/admin/${slug}/edit`);

  const post = await getPostBySlug(slug, { includeDrafts: true });
  if (!post) notFound();

  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <MonoLabel>Edit</MonoLabel>
          <h1 className="mt-4 text-3xl">{post.title}</h1>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="mono-label text-ink-subtle hover:text-ink transition-colors"
        >
          View &rarr;
        </Link>
      </div>

      <div className="mt-12">
        <MarkdownEditor
          mode="edit"
          initial={{
            slug: post.slug,
            title: post.title,
            summary: post.summary ?? "",
            content: post.content,
            coverImage: post.coverImage ?? "",
            status: post.status,
            tags: post.tags.map((t) => t.name),
          }}
        />
      </div>
    </Container>
  );
}
