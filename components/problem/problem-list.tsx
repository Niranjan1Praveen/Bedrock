"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ConceptTag, Problem } from "@/content/types";
import { DifficultyPill } from "@/components/ui/pill";
import { useProgress } from "@/lib/progress";

export interface ProblemSummary {
  id: number;
  slug: string;
  title: string;
  difficulty: Problem["difficulty"];
  concepts: ConceptTag[];
  hasVisual: boolean;
}

/**
 * Filterable index of a track.
 *
 * Only a projection of each problem is sent to the client -- never the full
 * content -- so the payload stays flat as the track grows to 50 problems.
 */
export function ProblemList({
  track,
  problems,
}: {
  track: string;
  problems: ProblemSummary[];
}) {
  const [filter, setFilter] = useState<ConceptTag | null>(null);
  const { get } = useProgress();

  const concepts = useMemo(() => {
    const counts = new Map<ConceptTag, number>();
    for (const p of problems) {
      for (const c of p.concepts) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [problems]);

  const shown = filter
    ? problems.filter((p) => p.concepts.includes(filter))
    : problems;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip active={filter === null} onClick={() => setFilter(null)}>
          All {problems.length}
        </FilterChip>
        {concepts.map(([concept, count]) => (
          <FilterChip
            key={concept}
            active={filter === concept}
            onClick={() => setFilter(filter === concept ? null : concept)}
          >
            {concept} {count}
          </FilterChip>
        ))}
      </div>

      <ul className="border-line border-t">
        {shown.map((p) => {
          const entry = get(track, p.slug);
          return (
            <li key={p.slug} className="border-line border-b">
              <Link
                href={`/tracks/${track}/${p.slug}`}
                className="group hover:bg-surface flex flex-col gap-2 px-2 py-5 transition-colors sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="mono-label text-ink-subtle w-12 shrink-0 tabular-nums">
                  {p.id}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2.5">
                    <span className="text-ink group-hover:text-ink truncate text-[15px]">
                      {p.title}
                    </span>
                    <DifficultyPill
                      difficulty={p.difficulty}
                      className="shrink-0"
                    />
                  </span>
                  <span className="mono-label text-ink-subtle mt-1.5 block truncate">
                    {p.concepts.join(" · ")}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-3">
                  {p.hasVisual && (
                    <span className="mono-label text-ink-subtle border-line rounded border px-1.5 py-0.5">
                      Animated
                    </span>
                  )}
                  {entry.starred && (
                    <span className="mono-label text-warn">Starred</span>
                  )}
                  <span
                    aria-label={entry.revised ? "Revised" : "Not yet revised"}
                    className={`size-1.5 rounded-full ${
                      entry.revised ? "bg-accent" : "bg-line"
                    }`}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {shown.length === 0 && (
        <p className="text-ink-subtle py-10 text-center text-sm">
          Nothing tagged {filter} yet.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mono-label rounded-full border px-3 py-1.5 transition-colors ${
        active
          ? "border-ink text-ink"
          : "border-line text-ink-subtle hover:border-ink-subtle hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
