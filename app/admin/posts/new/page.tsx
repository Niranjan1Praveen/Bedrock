import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  if (!(await getUser())) redirect("/login?next=/admin/posts/new");

  return (
    <Container className="py-16 sm:py-20">
      <nav className="mono-label text-ink-subtle flex items-center gap-2">
        <Link href="/admin" className="hover:text-ink transition-colors">
          Posts
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">New</span>
      </nav>
      <h1 className="mt-5 mb-12 text-3xl">Write</h1>
      <MarkdownEditor mode="new" />
    </Container>
  );
}
