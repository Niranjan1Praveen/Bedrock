import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import {
  ProblemList,
  type ProblemSummary,
} from "@/components/problem/problem-list";
import { getProblems, getTrack, getTracks } from "@/lib/content";

export async function generateStaticParams() {
  return (await getTracks()).map((t) => ({ track: t.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tracks/[track]">): Promise<Metadata> {
  const { track } = await params;
  const found = await getTrack(track);
  return found
    ? { title: found.title, description: found.blurb }
    : { title: "Track" };
}

export default async function TrackPage({
  params,
}: PageProps<"/tracks/[track]">) {
  const { track } = await params;
  const found = await getTrack(track);
  if (!found) notFound();

  const problems = await getProblems(track);

  const summaries: ProblemSummary[] = problems.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    concepts: p.concepts,
    hasVisual: Boolean(p.visual),
    section: p.section,
  }));

  return (
    <Container className="py-16 sm:py-24">
      <MonoLabel>
        {found.status === "active"
          ? `${problems.length} of ${found.total} written`
          : "Planned"}
      </MonoLabel>
      <h1 className="mt-4 text-3xl sm:text-4xl">{found.title}</h1>
      <p className="text-ink-muted mt-4 max-w-2xl leading-relaxed">
        {found.blurb}
      </p>

      <div className="mt-14">
        {problems.length > 0 ? (
          <ProblemList track={track} problems={summaries} />
        ) : (
          <p className="border-line text-ink-subtle rounded-lg border border-dashed px-6 py-16 text-center text-sm">
            Nothing written here yet.
          </p>
        )}
      </div>
    </Container>
  );
}
