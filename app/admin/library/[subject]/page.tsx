import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { TopicSection } from "@/components/library/topic-section";
import { getSubjectBySlug } from "@/lib/library";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/admin/library/[subject]">): Promise<Metadata> {
  const { subject } = await params;
  const found = await getSubjectBySlug(subject);
  return {
    title: found ? found.name : "Subject",
    robots: { index: false, follow: false },
  };
}

export default async function SubjectPage({
  params,
}: PageProps<"/admin/library/[subject]">) {
  const { subject } = await params;
  const found = await getSubjectBySlug(subject);
  if (!found) notFound();

  const total = found.topics.reduce((n, t) => n + t.documents.length, 0);

  return (
    <Container className="py-16 sm:py-20">
      <nav className="mono-label text-ink-subtle flex items-center gap-2">
        <Link href="/admin/library" className="hover:text-ink transition-colors">
          Library
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink truncate">{found.slug}</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-3xl">{found.name}</h1>
        <MonoLabel>
          {found.topics.length} topic{found.topics.length === 1 ? "" : "s"}
          {" · "}
          {total} file{total === 1 ? "" : "s"}
        </MonoLabel>
      </div>

      {found.topics.length === 0 ? (
        <p className="border-line text-ink-subtle mt-12 rounded-lg border border-dashed px-6 py-16 text-center text-sm">
          No topics in this subject yet.
        </p>
      ) : (
        <div className="mt-12 space-y-4">
          {found.topics.map((topic, i) => (
            <TopicSection
              key={topic.id}
              subjectSlug={found.slug}
              topic={{
                id: topic.id,
                slug: topic.slug,
                name: topic.name,
                documents: topic.documents.map((d) => ({
                  id: d.id,
                  slug: d.slug,
                  title: d.title,
                  sizeBytes: d.sizeBytes,
                  pageCount: d.pageCount,
                })),
              }}
              // First topic open, the rest collapsed: a subject with a dozen
              // topics is unusable on a phone if everything is expanded.
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
