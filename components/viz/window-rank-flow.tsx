"use client";

import { useMemo } from "react";
import type { Cell, Visual } from "@/content/types";
import { VizFrame } from "./viz-frame";
import { VizTable, type RowTone } from "./viz-table";
import { useVizSteps } from "./use-viz-steps";

type WindowVisual = Extract<Visual, { kind: "windowRank" }>;

/**
 * Shows what a window function does that GROUP BY cannot: it partitions the
 * rows, ranks within each partition, and then hands every original row back
 * with an extra column. Nothing is collapsed -- that is the whole distinction.
 */
export function WindowRankFlow({ visual }: { visual: WindowVisual }) {
  const { source, partitionBy, orderBy, fn, as, keepUpTo } = visual;
  const partIndex = partitionBy ? source.columns.indexOf(partitionBy) : -1;
  const orderIndex = source.columns.indexOf(orderBy);

  const partitions = useMemo(() => {
    const map = new Map<string, number[]>();
    source.rows.forEach((row, i) => {
      const key = partIndex >= 0 ? String(row[partIndex]) : "all rows";
      map.set(key, [...(map.get(key) ?? []), i]);
    });
    // Order within each partition, highest value first.
    return [...map.entries()].map(([key, rows]) => ({
      key,
      rows: [...rows].sort(
        (a, b) => Number(source.rows[b][orderIndex]) - Number(source.rows[a][orderIndex]),
      ),
    }));
  }, [source.rows, partIndex, orderIndex]);

  /** RANK skips after ties, DENSE_RANK does not, ROW_NUMBER never ties. */
  const ranksFor = (rowIdxs: number[]): number[] => {
    const out: number[] = [];
    let last: number | null = null;
    let rank = 0;
    rowIdxs.forEach((rowIdx, position) => {
      const value = Number(source.rows[rowIdx][orderIndex]);
      if (fn === "ROW_NUMBER") rank = position + 1;
      else if (last === null || value !== last)
        rank = fn === "RANK" ? position + 1 : rank + 1;
      out.push(rank);
      last = value;
    });
    return out;
  };

  // 0 = raw rows, 1 = partitioned, 2.. = one partition ranked, then summary
  const count = partitions.length + 3;
  const { index, next, prev, reset, toggle, playing } = useVizSteps(count);

  const partitioned = index >= 1;
  const cursor = index >= 2 && index < partitions.length + 2 ? index - 2 : -1;
  const ranked = Math.max(0, Math.min(index - 1, partitions.length));

  const caption = (() => {
    if (index === 0) {
      return `${source.rows.length} rows, in no particular order.`;
    }
    if (index === 1) {
      return partitionBy
        ? `PARTITION BY ${partitionBy} splits the rows into ${partitions.length} windows. Unlike GROUP BY, every row stays.`
        : `One window over all ${source.rows.length} rows.`;
    }
    if (cursor >= 0) {
      const p = partitions[cursor];
      const rs = ranksFor(p.rows);
      const tieNote =
        new Set(rs).size < rs.length
          ? fn === "DENSE_RANK"
            ? " Tied values share a rank, and the next rank still follows on."
            : fn === "RANK"
              ? " Tied values share a rank, and the next rank skips ahead."
              : ""
          : "";
      return `${partitionBy ? `${partitionBy} = ${p.key}: ` : ""}order by ${orderBy}, highest first, then number the rows.${tieNote}`;
    }
    return keepUpTo
      ? `Every row kept its identity and gained a ${as}. Filtering to ${as} <= ${keepUpTo} is now a plain WHERE on that column.`
      : `Every input row comes back with a ${as} column added.`;
  })();

  return (
    <VizFrame
      title={`${fn}() OVER (${partitionBy ? `PARTITION BY ${partitionBy} ` : ""}ORDER BY ${orderBy} DESC)`}
      caption={caption}
      index={index}
      count={count}
      playing={playing}
      onPrev={prev}
      onNext={next}
      onToggle={toggle}
      onReset={reset}
    >
      <div className="min-w-[32rem] space-y-6 sm:min-w-0">
        {!partitioned ? (
          <VizTable
            name={source.name}
            columns={source.columns}
            rows={source.rows}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partitions.map((p, pi) => {
              const done = pi < ranked;
              const isCursor = pi === cursor;
              const rs = ranksFor(p.rows);
              const rows: Cell[][] = p.rows.map((rowIdx, k) => [
                ...source.rows[rowIdx],
                done || isCursor ? rs[k] : "",
              ]);
              const tones: RowTone[] = p.rows.map((_, k) => {
                if (!done && !isCursor) return "idle";
                if (keepUpTo === undefined) return isCursor ? "active" : "match";
                return rs[k] <= keepUpTo ? "match" : "drop";
              });
              return (
                <div
                  key={p.key}
                  className={`border-line min-w-0 rounded-lg border p-3 transition-opacity duration-300 ${
                    partitionBy && !done && !isCursor ? "opacity-50" : ""
                  }`}
                >
                  <p className="mono-label text-ink-subtle mb-2.5 truncate">
                    {partitionBy ? `${partitionBy} = ${p.key}` : p.key}
                  </p>
                  <VizTable
                    columns={[...source.columns, as]}
                    rows={rows}
                    tones={tones}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </VizFrame>
  );
}
