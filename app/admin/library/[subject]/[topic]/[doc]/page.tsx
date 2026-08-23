import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/prisma";
import { DocumentViewer } from "@/components/library/document-viewer";
import { DeleteDocumentButton } from "@/components/library/delete-document-button";
import { formatBytes, isRevised } from "@/lib/library";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function load(subject: string, topic: string, doc: string) {
  return prisma.document.findFirst({
    where: {
      slug: doc,
      topic: { slug: topic, subject: { slug: subject } },
    },
    include: { topic: { include: { subject: true } } },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/admin/library/[subject]/[topic]/[doc]">): Promise<Metadata> {
  const { subject, topic, doc } = await params;
  const found = await load(subject, topic, doc);
  return {
    title: found ? found.title : "Document",
    robots: { index: false, follow: false },
  };
}

export default async function DocumentPage({
  params,
}: PageProps<"/admin/library/[subject]/[topic]/[doc]">) {
  const { subject, topic, doc } = await params;
  const found = await load(subject, topic, doc);
  if (!found) notFound();

  const user = await getUser();
  const userId = typeof user?.sub === "string" ? user.sub : "";
  const revised = userId ? await isRevised(userId, found.id) : false;

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mono-label text-ink-subtle flex flex-wrap items-center gap-2">
        <Link href="/admin/library" className="hover:text-ink transition-colors">
          Library
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/admin/library/${found.topic.subject.slug}`}
          className="hover:text-ink transition-colors"
        >
          {found.topic.subject.slug}
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate">{found.topic.slug}</span>
      </nav>

      <div className="mt-5 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl sm:text-3xl">{found.title}</h1>
          <p className="mono-label text-ink-subtle mt-3">
            {found.topic.subject.name} &middot; {found.topic.name} &middot;{" "}
            {formatBytes(found.sizeBytes)}
          </p>
        </div>
        <DeleteDocumentButton
          id={found.id}
          title={found.title}
          backTo={`/admin/library/${found.topic.subject.slug}`}
        />
      </div>

      {/* The viewer fetches its own signed URL client-side, so the link is
          never baked into this HTML. Which renderer runs is decided from the
          stored MIME type. */}
      <DocumentViewer
        documentId={found.id}
        title={found.title}
        storagePath={found.storagePath}
        mimeType={found.mimeType}
        initialPageCount={found.pageCount}
        revised={revised}
      />
    </Container>
  );
}
