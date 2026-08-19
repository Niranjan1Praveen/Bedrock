"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

interface VizFrameProps {
  title: string;
  caption: string;
  index: number;
  count: number;
  playing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
  onReset: () => void;
  children: ReactNode;
}

function ControlButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink disabled:hover:border-line disabled:hover:text-ink-subtle rounded border px-2.5 py-1.5 transition-colors disabled:opacity-35"
    >
      {children}
    </button>
  );
}

/**
 * Chrome, step counter, caption and transport controls for every flow.
 *
 * MotionConfig sits here rather than in each flow because every animated row
 * renders inside this component's children. `reducedMotion="user"` makes motion
 * skip transform and layout tweening for viewers who ask for it, while leaving
 * the step controls fully usable.
 */
export function VizFrame({
  title,
  caption,
  index,
  count,
  playing,
  onPrev,
  onNext,
  onToggle,
  onReset,
  children,
}: VizFrameProps) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <MotionConfig reducedMotion="user">
      <figure className="border-line bg-surface overflow-hidden rounded-xl border">
        <div className="border-line bg-surface-2 flex items-center justify-between border-b px-4 py-3">
          <span className="mono-label text-ink-subtle">{title}</span>
          <span className="mono-label text-ink-subtle tabular-nums">
            {pad(index + 1)} / {pad(count)}
          </span>
        </div>

        <div className="scroll-x px-4 py-6 sm:px-6">{children}</div>

        <figcaption className="border-line flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-ink-muted text-sm leading-relaxed">{caption}</p>
          <div className="flex shrink-0 gap-2">
            <ControlButton onClick={onReset} disabled={index === 0 && !playing}>
              Reset
            </ControlButton>
            <ControlButton onClick={onPrev} disabled={index === 0}>
              Prev
            </ControlButton>
            <ControlButton onClick={onToggle}>
              {playing ? "Pause" : "Play"}
            </ControlButton>
            <ControlButton onClick={onNext} disabled={index >= count - 1}>
              Next
            </ControlButton>
          </div>
        </figcaption>
      </figure>
    </MotionConfig>
  );
}
