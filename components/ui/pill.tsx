import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "info" | "warn";

const tones: Record<Tone, string> = {
  neutral: "border-line text-ink-subtle",
  accent: "border-accent/40 text-accent",
  info: "border-info/40 text-info",
  warn: "border-warn/40 text-warn",
};

/** Hairline-bordered mono chip. Used for concepts, difficulty and status. */
export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`mono-label inline-flex items-center rounded-full border px-2.5 py-1 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
