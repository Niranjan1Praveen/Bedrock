"use client";

import { useMemo } from "react";
import type { Cell, Table, Visual } from "@/content/types";
import { VizFrame } from "./viz-frame";
import { VizTable, type RowTone } from "./viz-table";
import { useVizSteps } from "./use-viz-steps";

type JoinVisual = Extract<Visual, { kind: "join" }>;

interface Pair {
  left: number | null;
  right: number | null;
}

const JOIN_LABEL: Record<JoinVisual["type"], string> = {
  inner: "INNER JOIN",
  left: "LEFT JOIN",
  right: "RIGHT JOIN",
  full: "FULL OUTER JOIN",
};

/**
 * Pairs rows from two tables, then emits the joined result one row at a time.
 *
 * All four join types are the same walk over a different pair list, which is
 * why this single component covers the whole family: what changes is only
 * which unmatched rows survive and which side gets NULL-filled.
 */
export function JoinFlow({
  visual,
  left,
  right,
}: {
  visual: JoinVisual;
  left: Table;
  right: Table;
}) {
  const leftKey = left.columns.indexOf(visual.on[0]);
  const rightKey = right.columns.indexOf(visual.on[1]);

  const pairs = useMemo<Pair[]>(() => {
    const out: Pair[] = [];
    const matchedRight = new Set<number>();

    if (visual.type !== "right") {
      left.rows.forEach((lr, li) => {
        const hits = right.rows
          .map((rr, ri) => (rr[rightKey] === lr[leftKey] ? ri : -1))
          .filter((ri) => ri !== -1);
        hits.forEach((ri) => {
          matchedRight.add(ri);
          out.push({ left: li, right: ri });
        });
        if (hits.length === 0 && visual.type !== "inner") {
          out.push({ left: li, right: null });
        }
      });
    }

    // RIGHT walks the other table; FULL appends whatever the left pass missed.
    if (visual.type === "right" || visual.type === "full") {
      right.rows.forEach((rr, ri) => {
        if (visual.type === "full" && matchedRight.has(ri)) return;
        const hits = left.rows
          .map((lr, li) => (lr[leftKey] === rr[rightKey] ? li : -1))
          .filter((li) => li !== -1);
        if (visual.type === "right") {
          hits.forEach((li) => out.push({ left: li, right: ri }));
          if (hits.length === 0) out.push({ left: null, right: ri });
        } else if (hits.length === 0) {
          out.push({ left: null, right: ri });
        }
      });
    }

    return out;
  }, [left.rows, right.rows, leftKey, rightKey, visual.type]);

  // 0 = both tables, 1 = key highlighted, 2.. = one pair each, then summary
  const count = pairs.length + 3;
  const { index, next, prev, reset, toggle, playing } = useVizSteps(count);

  const cursor = index >= 2 && index < pairs.length + 2 ? index - 2 : -1;
  const emitted = Math.max(0, Math.min(index - 1, pairs.length));
  const showKey = index >= 1;

  const nulls = (t: Table): Cell[] => t.columns.map(() => null);
  const rowFor = (p: Pair): Cell[] => [
    ...(p.left !== null ? left.rows[p.left] : nulls(left)),
    ...(p.right !== null ? right.rows[p.right] : nulls(right)),
  ];

  const resultRows = pairs.slice(0, emitted).map(rowFor);
  const resultTones: RowTone[] = pairs
    .slice(0, emitted)
    .map((p) => (p.left === null || p.right === null ? "unknown" : "match"));

  const done = new Set(
    pairs.slice(0, emitted).flatMap((p) => (p.left !== null ? [p.left] : [])),
  );
  const doneRight = new Set(
    pairs.slice(0, emitted).flatMap((p) => (p.right !== null ? [p.right] : [])),
  );
  const active = cursor >= 0 ? pairs[cursor] : null;

  const leftTones: RowTone[] = left.rows.map((_, i) =>
    active?.left === i ? "active" : done.has(i) ? "match" : "idle",
  );
  const rightTones: RowTone[] = right.rows.map((_, i) =>
    active?.right === i ? "info" : doneRight.has(i) ? "match" : "idle",
  );

  const caption = (() => {
    if (index === 0) {
      return `${left.name} has ${left.rows.length} rows, ${right.name} has ${right.rows.length}. A ${JOIN_LABEL[visual.type]} decides which of them survive.`;
    }
    if (index === 1) {
      return `The join key: ${left.name}.${visual.on[0]} = ${right.name}.${visual.on[1]}.`;
    }
    if (active) {
      if (active.right === null) {
        const key = String(left.rows[active.left!][leftKey]);
        return `${visual.on[0]} = ${key} has no match in ${right.name}. A ${JOIN_LABEL[visual.type]} emits the row anyway, filling every ${right.name} column with NULL.`;
      }
      if (active.left === null) {
        const key = String(right.rows[active.right][rightKey]);
        return `${visual.on[1]} = ${key} has no match in ${left.name}, so the ${left.name} columns come back NULL.`;
      }
      const key = String(left.rows[active.left!][leftKey]);
      return `${visual.on[0]} = ${key} matches. The two rows merge into one wider row.`;
    }
    const nullFilled = pairs.filter(
      (p) => p.left === null || p.right === null,
    ).length;
    return nullFilled > 0
      ? `${pairs.length} rows out, ${nullFilled} of them NULL-filled. An INNER JOIN would have returned only ${pairs.length - nullFilled}.`
      : `${pairs.length} rows out — only the keys present in both tables.`;
  })();

  const resultColumns = [...left.columns, ...right.columns];
  const rightColumnIndices = right.columns.map((_, i) => left.columns.length + i);

  return (
    <VizFrame
      title={JOIN_LABEL[visual.type]}
      caption={caption}
      index={index}
      count={count}
      playing={playing}
      onPrev={prev}
      onNext={next}
      onToggle={toggle}
      onReset={reset}
    >
      <div className="min-w-[34rem] space-y-7 sm:min-w-0">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <VizTable
            name={left.name}
            columns={left.columns}
            rows={left.rows}
            tones={leftTones}
            keyColumns={showKey ? [leftKey] : []}
          />
          <VizTable
            name={right.name}
            columns={right.columns}
            rows={right.rows}
            tones={rightTones}
            keyColumns={showKey ? [rightKey] : []}
            rightColumns={right.columns.map((_, i) => i)}
          />
        </div>

        <div className="border-line border-t pt-6">
          <VizTable
            name="joined rows"
            columns={resultColumns}
            rows={resultRows}
            tones={resultTones}
            rightColumns={rightColumnIndices}
            animateRows
            emptyLabel="no rows emitted yet"
          />
        </div>
      </div>
    </VizFrame>
  );
}
