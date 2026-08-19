"use client";

import { useMemo } from "react";
import type { Cell, Visual } from "@/content/types";
import { VizFrame } from "./viz-frame";
import { VizTable, type RowTone } from "./viz-table";
import { useVizSteps } from "./use-viz-steps";

type GroupByVisual = Extract<Visual, { kind: "groupBy" }>;

function aggregate(fn: GroupByVisual["agg"]["fn"], values: number[]): number {
  switch (fn) {
    case "AVG":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "SUM":
      return values.reduce((a, b) => a + b, 0);
    case "COUNT":
      return values.length;
    case "MAX":
      return Math.max(...values);
    case "MIN":
      return Math.min(...values);
  }
}

/**
 * Shows GROUP BY as what it physically is: rows falling into buckets, then
 * each bucket collapsing to exactly one row.
 *
 * Buckets are distinguished by a label and a panel border rather than by
 * colour, so the visualization stays readable as the group count grows.
 */
export function GroupByFlow({
  visual,
}: {
  visual: GroupByVisual;
}) {
  const { source, by, agg, round } = visual;
  const byIndex = source.columns.indexOf(by);
  const valueIndex = source.columns.indexOf(agg.column);

  const groups = useMemo(() => {
    const map = new Map<string, number[]>();
    source.rows.forEach((row, i) => {
      const key = String(row[byIndex]);
      map.set(key, [...(map.get(key) ?? []), i]);
    });
    return [...map.entries()].map(([key, rowIndices]) => ({ key, rowIndices }));
  }, [source.rows, byIndex]);

  // 0 = flat rows, 1 = bucketed, 2.. = one bucket collapsed each, then summary
  const count = groups.length + 3;
  const { index, next, prev, reset, toggle, playing } = useVizSteps(count);

  const bucketed = index >= 1;
  const cursor = index >= 2 && index < groups.length + 2 ? index - 2 : -1;
  const collapsed = Math.max(0, Math.min(index - 1, groups.length));

  const resultRows: Cell[][] = groups.slice(0, collapsed).map((g) => {
    const values = g.rowIndices.map((i) => Number(source.rows[i][valueIndex]));
    const value = aggregate(agg.fn, values);
    return [
      source.rows[g.rowIndices[0]][byIndex],
      round !== undefined ? value.toFixed(round) : value,
    ];
  });

  const caption = (() => {
    if (index === 0) {
      return `${source.rows.length} rows going in.`;
    }
    if (index === 1) {
      return `GROUP BY ${by} sorts the rows into ${groups.length} buckets. Nothing has been aggregated yet — the rows are all still there.`;
    }
    if (cursor >= 0) {
      const g = groups[cursor];
      const values = g.rowIndices.map((i) =>
        Number(source.rows[i][valueIndex]),
      );
      const value = aggregate(agg.fn, values);
      const fmt = (n: number) =>
        round !== undefined ? n.toFixed(round) : String(n);
      return `${by} = ${g.key}: ${agg.fn} of ${values.map(fmt).join(", ")} — the bucket's ${g.rowIndices.length} rows collapse into the single value ${fmt(value)}.`;
    }
    return `${source.rows.length} rows in, ${groups.length} out — one row per bucket. That is the whole contract of GROUP BY.`;
  })();

  return (
    <VizFrame
      title={`GROUP BY ${by}`}
      caption={caption}
      index={index}
      count={count}
      playing={playing}
      onPrev={prev}
      onNext={next}
      onToggle={toggle}
      onReset={reset}
    >
      <div className="min-w-[30rem] space-y-7 sm:min-w-0">
        {!bucketed ? (
          <VizTable
            name={source.name}
            columns={source.columns}
            rows={source.rows}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {groups.map((g, gi) => {
              const tone: RowTone =
                gi === cursor ? "active" : gi < collapsed ? "drop" : "idle";
              return (
                <div
                  key={g.key}
                  className={`border-line rounded-lg border p-3 transition-opacity duration-300 ${
                    gi < collapsed && gi !== cursor ? "opacity-45" : ""
                  }`}
                >
                  <p className="mono-label text-ink-subtle mb-2.5">
                    {by} = {g.key}
                  </p>
                  <VizTable
                    columns={source.columns}
                    rows={g.rowIndices.map((i) => source.rows[i])}
                    tones={g.rowIndices.map(() => tone)}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="border-line border-t pt-6">
          <VizTable
            name="one row per bucket"
            columns={[by, agg.as]}
            rows={resultRows}
            tones={resultRows.map(() => "match")}
            animateRows
            emptyLabel="nothing aggregated yet"
          />
        </div>
      </div>
    </VizFrame>
  );
}
