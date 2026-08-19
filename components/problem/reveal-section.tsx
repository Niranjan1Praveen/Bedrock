"use client";

import type { ReactNode } from "react";
import { useProgress } from "@/lib/progress";

/**
 * Hides the solution until asked for, so a problem can be used as a self-test.
 *
 * `children` is rendered on the server and passed through as a prop, which
 * keeps the shiki-highlighted query and the schema tables out of the client
 * bundle even though the toggle itself is interactive.
 */
export function RevealSection({
  track,
  slug,
  children,
}: {
  track: string;
  slug: string;
  children: ReactNode;
}) {
  const { get, update } = useProgress();
  const revealed = get(track, slug).revealed;

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => update(track, slug, { revealed: true })}
        className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink group flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-6 transition-colors"
      >
        Reveal solution
        <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
          &darr;
        </span>
      </button>
    );
  }

  return (
    <div>
      <div className="border-line mb-8 flex items-center justify-between border-b pb-3">
        <span className="mono-label text-ink-subtle">Solution</span>
        <button
          type="button"
          onClick={() => update(track, slug, { revealed: false })}
          className="mono-label text-ink-subtle hover:text-ink transition-colors"
        >
          Hide
        </button>
      </div>
      {children}
    </div>
  );
}
