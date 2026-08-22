import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { TopicSection } from "@/components/library/topic-section";
import { ProgressBar } from "@/components/library/progress-bar";
import { SubjectCoverField } from "@/components/library/subject-cover-field";
import { getUser } from "@/lib/auth";
import { getSubjectWithProgress } from "@/lib/library";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/admin/library/[subject]">): Promise<Metadata> {
  const { subject } = await params;
  return { title: subject, robots: { index: false, follow: false } };
}

export default async function SubjectPage({
  params,
}: PageProps<"/admin/library/[subject]">) {
  const { subject } = await params;
  const user = await getUser();
  const userId = typeof user?.sub === "string" ? user.sub : "";

  const found = await getSubjectWithProgress(subject, userId);
  if (!found) notFound();

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
          {found.documentCount} file{found.documentCount === 1 ? "" : "s"}
        </MonoLabel>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <div className="min-w-0 lg:order-2">
          <SubjectCoverField slug={found.slug} imageUrl={found.imageUrl} />
          <ProgressBar
            done={found.revisedCount}
            total={found.documentCount}
            className="mt-6"
          />
        </div>

        <div className="min-w-0 lg:order-1">
          {found.topics.length === 0 ? (
            <p className="border-line text-ink-subtle rounded-lg border border-dashed px-6 py-16 text-center text-sm">
              No topics in this subject yet.
            </p>
          ) : (
            <div className="space-y-4">
              {found.topics.map((topic, i) => (
                <TopicSection
                  key={topic.id}
                  subjectSlug={found.slug}
                  topic={topic}
                  // First topic open, the rest collapsed: a subject with a
                  // dozen topics is unusable on a phone fully expanded.
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
