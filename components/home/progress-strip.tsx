"use client";

import { useProgress } from "@/lib/progress";

/**
 * Reads straight from the progress store, so it renders 0 on the server and
 * settles to the real count after hydration without a mismatch.
 */
export function ProgressStrip({
  track,
  total,
}: {
  track: string;
  total: number;
}) {
  const { stats } = useProgress();
  const { revised, starred } = stats(track);
  const pct = total > 0 ? Math.round((revised / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-ink text-lg">
          <span className="tabular-nums">{revised}</span>
          <span className="text-ink-subtle"> of {total} revised</span>
        </p>
        {starred > 0 && (
          <span className="mono-label text-warn tabular-nums">
            {starred} starred
          </span>
        )}
      </div>

      <div
        className="bg-line mt-4 h-px w-full overflow-hidden"
        role="progressbar"
        aria-valuenow={revised}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Problems revised"
      >
        <div
          className="bg-accent h-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-ink-subtle mt-4 text-sm">
        Progress is kept in this browser only — no account, nothing sent
        anywhere.
      </p>
    </div>
  );
}
