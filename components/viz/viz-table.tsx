"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Cell } from "@/content/types";

export type RowTone =
  | "idle"
  | "active" /* currently under examination */
  | "match" /* satisfied the condition */
  | "drop" /* discarded */
  | "unknown" /* comparison returned UNKNOWN */
  | "info"; /* belongs to the right-hand table of a join */

const rowTones: Record<RowTone, string> = {
  idle: "border-line-soft text-ink-muted",
  active: "border-ink bg-ink/5 text-ink",
  match: "border-accent/50 bg-accent/8 text-ink",
  drop: "border-line-soft text-ink-subtle opacity-30",
  unknown: "border-warn/50 bg-warn/8 text-ink",
  info: "border-info/40 bg-info/5 text-ink",
};

/** NULL is a value, not an absence -- render it as one. */
function CellValue({ value }: { value: Cell }) {
  if (value === null) {
    return <span className="mono-label text-warn">null</span>;
  }
  return <span className="tabular-nums">{String(value)}</span>;
}

export interface VizTableProps {
  name?: string;
  columns: string[];
  rows: Cell[][];
  /** Tone per row, index-aligned with `rows`. Defaults to idle. */
  tones?: RowTone[];
  /** Column indices to mark as the join / group key. */
  keyColumns?: number[];
  /** Column indices sourced from the right-hand table, tinted in the header. */
  rightColumns?: number[];
  /** Shown when `rows` is empty. */
  emptyLabel?: string;
  /** Animate rows in as they arrive (used by result tables). */
  animateRows?: boolean;
}

export function VizTable({
  name,
  columns,
  rows,
  tones,
  keyColumns = [],
  rightColumns = [],
  emptyLabel = "no rows yet",
  animateRows = false,
}: VizTableProps) {
  return (
    <div className="min-w-0">
      {name && (
        <p className="mono-label text-ink-subtle mb-2.5">{name}</p>
      )}

      <div className="grid gap-1">
        {/* Header */}
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((col, i) => (
            <div
              key={`${col}-${i}`}
              className={`mono-label truncate px-2.5 py-1.5 ${
                rightColumns.includes(i) ? "text-info" : "text-ink-subtle"
              } ${keyColumns.includes(i) ? "border-b border-dashed border-current" : ""}`}
              title={col}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.length === 0 ? (
          <div className="border-line-soft text-ink-subtle rounded border border-dashed px-2.5 py-3 text-center">
            <span className="mono-label">{emptyLabel}</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {rows.map((row, r) => {
              const tone = tones?.[r] ?? "idle";
              return (
                <motion.div
                  // Keyed by position, not by content: a content key re-keys the
                  // row whenever a cell changes, which sends it through a full
                  // exit/enter and briefly renders both copies at once.
                  key={`row-${r}`}
                  initial={animateRows ? { opacity: 0, y: -6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className={`grid gap-1 rounded border px-0.5 py-0.5 font-mono text-xs transition-colors duration-300 sm:text-[13px] ${rowTones[tone]}`}
                  style={{
                    gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((cell, c) => (
                    <div key={c} className="truncate px-2 py-1.5">
                      <CellValue value={cell} />
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
