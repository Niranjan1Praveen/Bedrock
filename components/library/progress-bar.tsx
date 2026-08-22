/** Thin bar plus a count, used wherever revision progress is shown. */
export function ProgressBar({
  done,
  total,
  className = "",
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`mono-label tabular-nums ${complete ? "text-accent" : "text-ink-subtle"}`}
        >
          {done} / {total} revised
        </span>
        <span className="mono-label text-ink-subtle tabular-nums">{pct}%</span>
      </div>
      <div
        className="bg-line mt-2 h-px w-full overflow-hidden"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Documents revised"
      >
        <div
          className={`h-full transition-[width] duration-500 ${complete ? "bg-accent" : "bg-ink-subtle"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
