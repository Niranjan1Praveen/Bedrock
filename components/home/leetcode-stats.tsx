"use client";

import { useEffect, useState } from "react";
import { MonoLabel } from "@/components/ui/mono-label";
import {
  LEETCODE_USERNAME,
  RateLimitError,
  loadLeetCodeStats,
  profileUrl,
  relativeTime,
  type DifficultyStat,
  type LeetCodeStats as Stats,
} from "@/lib/leetcode";

type State =
  | { status: "loading" }
  | { status: "ok"; stats: Stats; fetchedAt: number; stale: boolean }
  | { status: "error"; message: string };

const BAR: Record<DifficultyStat["level"], string> = {
  Easy: "bg-easy",
  Medium: "bg-medium",
  Hard: "bg-hard",
};
const TEXT: Record<DifficultyStat["level"], string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
};

const n = (v: number) => v.toLocaleString("en-US");

export function LeetCodeStats() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    // force only on an explicit refresh, so mounting never bypasses the cache.
    loadLeetCodeStats({ force: attempt > 0 })
      .then(({ stats, fetchedAt, stale }) => {
        if (!cancelled) setState({ status: "ok", stats, fetchedAt, stale });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof RateLimitError
            ? `Rate limited by the stats API, which allows 120 requests an hour. It should work again in about ${Math.max(1, Math.round(err.retryAfterSeconds / 60))} minutes.`
            : err instanceof TypeError
              ? "Could not reach the stats service."
              : err instanceof Error
                ? err.message
                : "Could not load stats.";
        setState({ status: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <MonoLabel>LeetCode</MonoLabel>
        <div className="flex items-center gap-4">
          {state.status === "ok" && (
            <button
              type="button"
              onClick={() => {
                setState({ status: "loading" });
                setAttempt((a) => a + 1);
              }}
              className="mono-label text-ink-subtle hover:text-ink transition-colors"
            >
              Refresh
            </button>
          )}
          <a
            href={profileUrl()}
            target="_blank"
            rel="noreferrer noopener"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            {LEETCODE_USERNAME} &rarr;
          </a>
        </div>
      </div>

      <div className="mt-8">
        {state.status === "loading" && <Skeleton />}

        {state.status === "error" && (
          <div className="border-line rounded-xl border border-dashed px-6 py-10 text-center">
            <p className="text-ink-muted text-sm">{state.message}</p>
            <button
              type="button"
              onClick={() => {
                setState({ status: "loading" });
                setAttempt((a) => a + 1);
              }}
              className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink mt-5 rounded border px-3 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {state.status === "ok" && (
          <>
            <Loaded stats={state.stats} />
            {state.stale && (
              <p className="text-ink-subtle mt-8 text-sm">
                Showing cached numbers from {relativeTime(state.fetchedAt)}. The
                stats API could not be reached just now.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Loaded({ stats }: { stats: Stats }) {
  const solvedTotal = stats.byDifficulty.reduce((a, d) => a + d.solved, 0) || 1;

  // grid-cols-1 rather than a bare `grid`: an implicit grid column is sized
  // `auto`, i.e. max-content, so a long problem title would widen the column
  // past the page instead of ellipsing. min-w-0 on each child is the other
  // half of the same guard.
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
      <div className="min-w-0">
        <p className="text-ink text-5xl tracking-tight tabular-nums">
          {n(stats.totalSolved)}
        </p>
        <p className="text-ink-subtle mt-2 text-sm">
          solved of {n(stats.totalQuestions)} problems
        </p>

        {/* Proportion of solves by difficulty. A bar against LeetCode's full
            catalogue would be a 2% sliver and tell you nothing; the mix of
            what has actually been solved is the informative shape. */}
        <div className="bg-line mt-7 flex h-1.5 w-full overflow-hidden rounded-full">
          {stats.byDifficulty.map((d) => (
            <div
              key={d.level}
              className={BAR[d.level]}
              style={{ width: `${(d.solved / solvedTotal) * 100}%` }}
            />
          ))}
        </div>

        <ul className="mt-6 space-y-3">
          {stats.byDifficulty.map((d) => (
            <li key={d.level} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className={`size-1.5 shrink-0 rounded-full ${BAR[d.level]}`}
              />
              <span className={`mono-label ${TEXT[d.level]} w-16`}>
                {d.level}
              </span>
              <span className="text-ink tabular-nums">{n(d.solved)}</span>
              <span className="text-ink-subtle tabular-nums">
                of {n(d.total)}
              </span>
            </li>
          ))}
        </ul>

        <p className="border-line text-ink-subtle mt-7 border-t pt-5 text-sm">
          Global rank{" "}
          <span className="text-ink-muted tabular-nums">
            {n(stats.ranking)}
          </span>
        </p>
      </div>

      <div className="min-w-0">
        <MonoLabel>Recent solves</MonoLabel>
        {stats.recent.length === 0 ? (
          <p className="text-ink-subtle mt-5 text-sm">
            No recent accepted submissions.
          </p>
        ) : (
          <ul className="border-line mt-5 border-t">
            {stats.recent.map((r) => (
              <li key={r.slug} className="border-line border-b">
                <a
                  href={`https://leetcode.com/problems/${r.slug}/`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center gap-4 py-3.5"
                >
                  <span className="text-ink-muted group-hover:text-ink min-w-0 flex-1 truncate text-sm transition-colors">
                    {r.title}
                  </span>
                  <span className="mono-label text-ink-subtle border-line shrink-0 rounded border px-1.5 py-0.5">
                    {r.lang}
                  </span>
                  <span className="mono-label text-ink-subtle w-16 shrink-0 text-right">
                    {relativeTime(r.at)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="bg-line h-12 w-28 rounded" />
      <div className="bg-line mt-4 h-3 w-44 rounded" />
      <div className="bg-line mt-7 h-1.5 w-full rounded-full" />
      <div className="mt-6 space-y-3">
        <div className="bg-line h-3 w-56 rounded" />
        <div className="bg-line h-3 w-52 rounded" />
        <div className="bg-line h-3 w-48 rounded" />
      </div>
    </div>
  );
}
