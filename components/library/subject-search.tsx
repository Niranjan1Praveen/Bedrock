"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SubjectCover } from "@/components/library/subject-cover";
import { ProgressBar } from "@/components/library/progress-bar";
import type { SubjectCard } from "@/lib/library";

/**
 * Searchable subject grid.
 *
 * Filtering happens in the browser against data the page already carries, so
 * there is no request per keystroke and no loading state to design around. A
 * subject matches on its own name or on any of its topic names, and when the
 * match came from a topic the card says which one -- otherwise a card
 * appearing for a term not visible on it looks like a bug.
 */
export function SubjectSearch({ subjects }: { subjects: SubjectCard[] }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return subjects.map((s) => ({ subject: s, matchedTopics: [] as string[] }));

    return subjects
      .map((s) => ({
        subject: s,
        nameHit: s.name.toLowerCase().includes(term),
        matchedTopics: s.topicNames.filter((t) => t.toLowerCase().includes(term)),
      }))
      .filter((r) => r.nameHit || r.matchedTopics.length > 0)
      .map(({ subject, matchedTopics }) => ({ subject, matchedTopics }));
  }, [subjects, term]);

  return (
    <div>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <label htmlFor="subject-search" className="sr-only">
            Search subjects and topics
          </label>
          <input
            id="subject-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects and topics"
            className="border-line bg-surface text-ink placeholder:text-ink-subtle focus:border-ink-subtle w-full rounded border px-3 py-2.5 text-sm outline-none transition-colors"
          />
        </div>
        {term && (
          <span className="mono-label text-ink-subtle">
            {results.length} of {subjects.length}
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <p className="border-line text-ink-subtle mt-8 rounded-lg border border-dashed px-6 py-16 text-center text-sm">
          Nothing matches {query}.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ subject: s, matchedTopics }) => (
            <Link
              key={s.id}
              href={`/admin/library/${s.slug}`}
              className="border-line hover:bg-surface group min-w-0 overflow-hidden rounded-xl border transition-colors"
            >
              <SubjectCover slug={s.slug} imageUrl={s.imageUrl} />
              <div className="border-line border-t p-5">
                <h2 className="truncate text-lg">{s.name}</h2>
                <p className="mono-label text-ink-subtle mt-2">
                  {s.topicCount} topic{s.topicCount === 1 ? "" : "s"} &middot;{" "}
                  {s.documentCount} file{s.documentCount === 1 ? "" : "s"}
                </p>

                {matchedTopics.length > 0 && (
                  <p className="mono-label text-accent mt-3 truncate">
                    {matchedTopics.slice(0, 2).join(" · ")}
                    {matchedTopics.length > 2
                      ? ` +${matchedTopics.length - 2}`
                      : ""}
                  </p>
                )}

                <ProgressBar
                  done={s.revisedCount}
                  total={s.documentCount}
                  className="mt-5"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
