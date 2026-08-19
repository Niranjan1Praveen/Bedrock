import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import { DeletePostButton } from "@/components/admin/delete-post-button";
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
      <nav className="mono-label text-ink-subtle flex items-center gap-2">
        <Link href="/admin" className="hover:text-ink transition-colors">
          Posts
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink truncate">{post.slug}</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Pill tone={post.status === "PUBLISHED" ? "accent" : "warn"}>
              {post.status === "PUBLISHED" ? "Live" : "Draft"}
            </Pill>
            <MonoLabel>
              {post.status === "PUBLISHED"
                ? "Visible to everyone"
                : "Visible only to you"}
            </MonoLabel>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <Link
            href={`/blog/${post.slug}`}
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            View &rarr;
          </Link>
          <DeletePostButton slug={post.slug} title={post.title} />
        </div>
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
