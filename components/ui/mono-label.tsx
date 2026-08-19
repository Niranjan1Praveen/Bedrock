import type { ReactNode } from "react";

/** Small uppercase mono eyebrow used above every section. */
export function MonoLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`mono-label text-ink-subtle ${className}`}>{children}</span>
  );
}
