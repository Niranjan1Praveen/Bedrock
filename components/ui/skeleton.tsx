/**
 * Loading placeholders.
 *
 * Shaped like the content they stand in for, so the page does not jump when
 * the real thing arrives. Built from `bg-line` at low opacity, which reads as
 * an absence rather than as a component in its own right.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-line/50 animate-pulse rounded ${className}`} />;
}

/** A page's eyebrow, title and standfirst. */
export function SkeletonHeader() {
  return (
    <div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-9 w-64" />
      <Skeleton className="mt-4 h-4 w-full max-w-md" />
    </div>
  );
}

/** Hairline rows, matching the list styling used across the site. */
export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="border-line border-t">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="border-line flex items-center gap-6 border-b py-5">
          <Skeleton className="h-3 w-28 shrink-0" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

/** Cards with a cover band, matching the library index. */
export function SkeletonCards({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="border-line overflow-hidden rounded-xl border">
          <Skeleton className="aspect-[12/6] w-full rounded-none" />
          <div className="border-line border-t p-5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="mt-3 h-3 w-1/3" />
            <Skeleton className="mt-6 h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Collapsible topic panels. */
export function SkeletonPanels({ panels = 4 }: { panels?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: panels }, (_, i) => (
        <div key={i} className="border-line rounded-xl border px-5 py-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-3 h-3 w-40" />
        </div>
      ))}
    </div>
  );
}

/** The figures row on the admin overview. */
export function SkeletonFigures({ count = 6 }: { count?: number }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-8 w-12" />
        </div>
      ))}
    </dl>
  );
}
