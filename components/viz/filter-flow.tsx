"use client";

import { useMemo } from "react";
import type { Cell, Table, Visual } from "@/content/types";
import { VizFrame } from "./viz-frame";
import { VizTable, type RowTone } from "./viz-table";
import { useVizSteps } from "./use-viz-steps";

type FilterVisual = Extract<Visual, { kind: "filter" }>;

type Verdict = "true" | "false" | "unknown";

/**
 * Walks a WHERE clause down a table one row at a time.
 *
 * The UNKNOWN verdict is the reason this component exists: a comparison
 * against NULL is neither true nor false, and WHERE keeps only true, so those
 * rows vanish. Showing them fall out in a different colour makes the rule
 * concrete in a way that prose does not.
 */
export function FilterFlow({
  visual,
  table,
}: {
  visual: FilterVisual;
  table: Table;
}) {
  const verdicts = useMemo<Verdict[]>(
    () =>
      table.rows.map((_, i) =>
        visual.unknown?.includes(i)
          ? "unknown"
          : visual.keep.includes(i)
            ? "true"
            : "false",
      ),
    [table.rows, visual.keep, visual.unknown],
  );

  const labelFor = (row: Cell[]) => {
    const pkIndex = table.pk ? table.columns.indexOf(table.pk) : 0;
    return `${table.columns[pkIndex]} = ${String(row[pkIndex])}`;
  };

  // step 0 = untouched, steps 1..n = one row each, final = summary
  const count = table.rows.length + 2;
  const { index, next, prev, reset, toggle, playing } = useVizSteps(count);

  const examined = Math.min(index, table.rows.length); // rows resolved so far
  const cursor = index >= 1 && index <= table.rows.length ? index - 1 : -1;

  const tones: RowTone[] = table.rows.map((_, i) => {
    if (i === cursor) return "active";
    if (i >= examined) return "idle";
    return verdicts[i] === "true"
      ? "match"
      : verdicts[i] === "unknown"
        ? "unknown"
        : "drop";
  });

  const kept = table.rows.filter(
    (_, i) => i < examined && verdicts[i] === "true",
  );

  const caption = (() => {
    if (index === 0) {
      return `FROM ${table.name} — all ${table.rows.length} rows, before the filter.`;
    }
    if (cursor >= 0) {
      const v = verdicts[cursor];
      const who = labelFor(table.rows[cursor]);
      if (v === "true") return `${who} — the predicate is true. Row is kept.`;
      if (v === "false") return `${who} — the predicate is false. Row is dropped.`;
      return `${who} — the value is NULL, so the comparison returns UNKNOWN. Not true, so the row is dropped.`;
    }
    const unknownCount = visual.unknown?.length ?? 0;
    return unknownCount > 0
      ? `${kept.length} of ${table.rows.length} rows survive. ${unknownCount} were lost to UNKNOWN, not to a false comparison — that distinction is the whole problem.`
      : `${kept.length} of ${table.rows.length} rows survive.`;
  })();

  return (
    <VizFrame
      title="WHERE, row by row"
      caption={caption}
      index={index}
      count={count}
      playing={playing}
      onPrev={prev}
      onNext={next}
      onToggle={toggle}
      onReset={reset}
    >
      <div className="grid min-w-[34rem] gap-6 sm:min-w-0 sm:grid-cols-[1.15fr_0.85fr] sm:gap-8">
        <VizTable
          name={table.name}
          columns={table.columns}
          rows={table.rows}
          tones={tones}
        />
        <div>
          <p className="mono-label text-ink-subtle mb-2.5">
            kept · {visual.predicate}
          </p>
          <VizTable
            columns={table.columns}
            rows={kept}
            tones={kept.map(() => "match")}
            animateRows
            emptyLabel="nothing yet"
          />
        </div>
      </div>
    </VizFrame>
  );
}
