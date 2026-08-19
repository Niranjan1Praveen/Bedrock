import type { ReactNode } from "react";
import type { Problem } from "@/content/types";

type Tone = "neutral" | "accent" | "info" | "warn" | "easy" | "medium" | "hard";

const tones: Record<Tone, string> = {
  neutral: "border-line text-ink-subtle",
  accent: "border-accent/40 text-accent",
  info: "border-info/40 text-info",
  warn: "border-warn/40 text-warn",
  easy: "border-easy/40 text-easy bg-easy/8",
  medium: "border-medium/40 text-medium bg-medium/8",
  hard: "border-hard/40 text-hard bg-hard/8",
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

const difficultyTone: Record<Problem["difficulty"], Tone> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

/** Difficulty chip, colour-coded the way LeetCode codes it. */
export function DifficultyPill({
  difficulty,
  className = "",
}: {
  difficulty: Problem["difficulty"];
  className?: string;
}) {
  return (
    <Pill tone={difficultyTone[difficulty]} className={className}>
      {difficulty}
    </Pill>
  );
}
