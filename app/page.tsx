import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import { Viz } from "@/components/viz";
import { ProgressStrip } from "@/components/home/progress-strip";
import { LeetCodeStats } from "@/components/home/leetcode-stats";
import {
  getConceptCounts,
  getProblem,
  getProblems,
  getTracks,
} from "@/lib/content";

const HOW = [
  {
    title: "Read the brief",
    text: "The problem in two sentences, with the schema and the sample rows it actually operates on. No story, no padding.",
  },
  {
    title: "Check yourself",
    text: "The solution stays hidden until you ask for it, so a problem you have seen before still works as a test.",
  },
  {
    title: "Watch the rows move",
    text: "Where the idea is spatial — a join, a filter, a grouping — step through it on the same rows you just read.",
  },
];

export default async function HomePage() {
  const [tracks, sql50, concepts, specimen] = await Promise.all([
    getTracks(),
    getProblems("sql-50"),
    getConceptCounts("sql-50"),
    getProblem("sql-50", "replace-employee-id-with-the-unique-identifier"),
  ]);

  return (
    <>
      {/* Hero */}
      <Container className="pt-20 pb-16 sm:pt-28 sm:pb-20">
        <MonoLabel>Learn · Revise · Retain</MonoLabel>
        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
          The concepts stick when you can see them move.
        </h1>
        <p className="text-ink-muted mt-7 max-w-xl leading-relaxed">
          Brief, visual reference notes for the patterns worth remembering —
          each one short enough to re-read before an interview, and animated
          where a diagram beats a paragraph.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/tracks/sql-50"
            className="mono-label bg-ink text-base hover:bg-ink-muted rounded px-5 py-3 transition-colors"
          >
            Start with SQL 50
          </Link>
          <Link
            href="/tracks"
            className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded border px-5 py-3 transition-colors"
          >
            Browse tracks
          </Link>
        </div>
      </Container>

      {/* Live specimen -- the product itself, not a screenshot of it */}
      {specimen?.visual && (
        <Container className="pb-20 sm:pb-28">
          <Viz visual={specimen.visual} tables={specimen.tables} />
          <p className="text-ink-subtle mt-4 text-sm">
            From{" "}
            <Link
              href={`/tracks/sql-50/${specimen.slug}`}
              className="text-ink-muted hover:text-ink underline underline-offset-4 transition-colors"
            >
              {specimen.id}. {specimen.title}
            </Link>
          </p>
        </Container>
      )}

      {/* Tracks */}
      <Container>
        <section className="border-line border-t py-16 sm:py-20">
          <MonoLabel>Tracks</MonoLabel>
          <div className="mt-8 grid gap-px sm:grid-cols-3">
            {tracks.map((track) => {
              const active = track.status === "active";
              const body = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg">{track.title}</h2>
                    <Pill tone={active ? "accent" : "neutral"}>
                      {active ? `${sql50.length} / ${track.total}` : "Soon"}
                    </Pill>
                  </div>
                  <p className="text-ink-muted mt-4 text-sm leading-relaxed">
                    {track.blurb}
                  </p>
                </>
              );
              return active ? (
                <Link
                  key={track.id}
                  href={`/tracks/${track.id}`}
                  className="border-line hover:bg-surface rounded-xl border p-6 transition-colors"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={track.id}
                  className="border-line rounded-xl border p-6 opacity-40"
                >
                  {body}
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="border-line border-t py-16 sm:py-20">
          <MonoLabel>How it works</MonoLabel>
          <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {HOW.map((item, i) => (
              <div key={item.title}>
                <MonoLabel>{String(i + 1).padStart(2, "0")}</MonoLabel>
                <h3 className="mt-4 text-lg">{item.title}</h3>
                <p className="text-ink-muted mt-3 text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Concept index */}
        <section className="border-line border-t py-16 sm:py-20">
          <MonoLabel>Concepts covered</MonoLabel>
          <p className="text-ink-muted mt-4 max-w-xl text-sm leading-relaxed">
            The index doubles as a revision checklist — it fills out as the
            track does.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {concepts.map(({ concept, count }) => (
              <span
                key={concept}
                className="mono-label border-line text-ink-subtle rounded border px-3 py-2"
              >
                {concept}{" "}
                <span className="text-ink-subtle/60 tabular-nums">{count}</span>
              </span>
            ))}
          </div>
        </section>

        {/* Progress: what has been revised here, then what has been solved there */}
        <section className="border-line border-t py-16 sm:py-20">
          <MonoLabel>Revised here</MonoLabel>
          <div className="mt-8 max-w-md">
            <ProgressStrip track="sql-50" total={sql50.length} />
          </div>
        </section>

        <section className="border-line border-t py-16 sm:py-20">
          <LeetCodeStats />
        </section>
      </Container>
    </>
  );
}
