"use client";

import { useProgress } from "@/lib/progress";

function Toggle({
  on,
  onClick,
  children,
  tone = "accent",
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "accent" | "warn";
}) {
  const active =
    tone === "accent"
      ? "border-accent/50 text-accent bg-accent/8"
      : "border-warn/50 text-warn bg-warn/8";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`mono-label rounded border px-3 py-2 transition-colors ${
        on
          ? active
          : "border-line text-ink-subtle hover:border-ink-subtle hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function ProgressControls({
  track,
  slug,
}: {
  track: string;
  slug: string;
}) {
  const { get, update } = useProgress();
  const entry = get(track, slug);

  return (
    <div className="flex flex-wrap gap-2">
      <Toggle
        on={entry.revised}
        onClick={() => update(track, slug, { revised: !entry.revised })}
      >
        {entry.revised ? "Revised" : "Mark as revised"}
      </Toggle>
      <Toggle
        tone="warn"
        on={entry.starred}
        onClick={() => update(track, slug, { starred: !entry.starred })}
      >
        {entry.starred ? "Starred" : "Star"}
      </Toggle>
    </div>
  );
}
