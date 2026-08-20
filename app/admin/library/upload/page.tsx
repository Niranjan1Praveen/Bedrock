import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { UploadForm } from "@/components/library/upload-form";
import { getLibraryTree } from "@/lib/library";

export const metadata: Metadata = {
  title: "Upload to library",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const tree = await getLibraryTree();

  return (
    <Container className="py-16 sm:py-20">
      <nav className="mono-label text-ink-subtle flex items-center gap-2">
        <Link href="/admin/library" className="hover:text-ink transition-colors">
          Library
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">Upload</span>
      </nav>

      <h1 className="mt-5 text-3xl">Add documents</h1>
      <p className="text-ink-subtle mt-3 max-w-xl text-sm leading-relaxed">
        Choose a subject and sub-topic, then add every file for it at once.
        Files go straight from this browser to storage.
      </p>

      <div className="mt-12">
        <UploadForm tree={tree} />
      </div>
    </Container>
  );
}
