import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { DifficultyPill, Pill } from "@/components/ui/pill";
import { DataTable } from "@/components/ui/data-table";
import { QueryBlock } from "@/components/problem/query-block";
import { RevealSection } from "@/components/problem/reveal-section";
import { ProgressControls } from "@/components/problem/progress-controls";
import { Viz } from "@/components/viz";
import {
  getAllProblemParams,
  getNeighbours,
  getProblem,
  getTrack,
} from "@/lib/content";

export async function generateStaticParams() {
  return getAllProblemParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/tracks/[track]/[slug]">): Promise<Metadata> {
  const { track, slug } = await params;
  const problem = await getProblem(track, slug);
  return problem
    ? { title: `${problem.id}. ${problem.title}`, description: problem.brief }
    : { title: "Problem" };
}

export default async function ProblemPage({
  params,
}: PageProps<"/tracks/[track]/[slug]">) {
  const { track, slug } = await params;
  const [problem, trackMeta, { prev, next }] = await Promise.all([
    getProblem(track, slug),
    getTrack(track),
    getNeighbours(track, slug),
  ]);
  if (!problem || !trackMeta) notFound();

  return (
    <Container className="py-12 sm:py-16">
      {/* Header */}
      <nav className="mono-label text-ink-subtle flex items-center gap-2">
        <Link href={`/tracks/${track}`} className="hover:text-ink transition-colors">
          {trackMeta.title}
        </Link>
        <span aria-hidden>/</span>
        <span className="tabular-nums">{problem.id}</span>
      </nav>

      <h1 className="mt-5 max-w-3xl text-3xl sm:text-4xl">{problem.title}</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <DifficultyPill difficulty={problem.difficulty} />
        {problem.concepts.map((c) => (
          <Pill key={c}>{c}</Pill>
        ))}
      </div>

      {/* Always visible: the problem itself */}
      <section className="mt-12 max-w-3xl">
        <p className="text-ink-muted leading-relaxed">{problem.brief}</p>
        <p className="border-ink/20 text-ink mt-6 border-l pl-4 leading-relaxed">
          {problem.ask}
        </p>
      </section>

      <section className="mt-12">
        <MonoLabel>Schema</MonoLabel>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          {problem.tables.map((t) => (
            <DataTable key={t.name} table={t} />
          ))}
        </div>
      </section>

      <section className="mt-10 max-w-lg">
        <MonoLabel>Expected output</MonoLabel>
        <div className="mt-5">
          <DataTable table={problem.expected} />
        </div>
      </section>

      {/* Behind the reveal */}
      <div className="mt-16">
        <RevealSection track={track} slug={slug}>
          <div className="space-y-14">
            <section className="max-w-3xl">
              <MonoLabel>Key idea</MonoLabel>
              <p className="text-ink mt-4 text-lg leading-relaxed">
                {problem.keyIdea}
              </p>
            </section>

            <section>
              <MonoLabel>Query</MonoLabel>
              <div className="mt-4 max-w-3xl">
                <QueryBlock query={problem.query} />
              </div>
            </section>

            <section className="max-w-3xl">
              <MonoLabel>Walkthrough</MonoLabel>
              <ol className="border-line mt-5 border-t">
                {problem.walkthrough.map((step, i) => (
                  <li
                    key={step.label}
                    className="border-line flex gap-5 border-b py-5"
                  >
                    <span className="mono-label text-ink-subtle w-6 shrink-0 pt-0.5 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="mono-label text-ink">{step.label}</p>
                      <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {problem.visual && (
              <section>
                <MonoLabel>What it looks like</MonoLabel>
                <div className="mt-5">
                  <Viz visual={problem.visual} tables={problem.tables} />
                </div>
              </section>
            )}

            {problem.gotcha && (
              <section className="max-w-3xl">
                <MonoLabel className="text-warn!">Gotcha</MonoLabel>
                <p className="border-warn/40 text-ink-muted mt-4 border-l pl-4 leading-relaxed">
                  {problem.gotcha}
                </p>
              </section>
            )}
          </div>
        </RevealSection>
      </div>

      {/* Footer: progress and navigation */}
      <div className="border-line mt-16 border-t pt-8">
        <ProgressControls track={track} slug={slug} />

        <div className="mt-8 flex items-center justify-between gap-6">
          {prev ? (
            <Link
              href={`/tracks/${track}/${prev.slug}`}
              className="group min-w-0 flex-1"
            >
              <MonoLabel>Previous</MonoLabel>
              <span className="text-ink-muted group-hover:text-ink mt-2 block truncate text-sm transition-colors">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}

          {next && (
            <Link
              href={`/tracks/${track}/${next.slug}`}
              className="group min-w-0 flex-1 text-right"
            >
              <MonoLabel>Next</MonoLabel>
              <span className="text-ink-muted group-hover:text-ink mt-2 block truncate text-sm transition-colors">
                {next.title}
              </span>
            </Link>
          )}
        </div>

        <a
          href={problem.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mono-label text-ink-subtle hover:text-ink mt-10 inline-block transition-colors"
        >
          View on LeetCode &rarr;
        </a>
      </div>
    </Container>
  );
}
