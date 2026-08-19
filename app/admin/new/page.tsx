import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  if (!(await getUser())) redirect("/login?next=/admin/new");

  return (
    <Container className="py-16 sm:py-20">
      <MonoLabel>New post</MonoLabel>
      <h1 className="mt-4 mb-12 text-3xl">Write</h1>
      <MarkdownEditor mode="new" />
    </Container>
  );
}
