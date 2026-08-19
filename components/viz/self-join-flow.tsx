"use client";

import type { Cell, Table, Visual } from "@/content/types";
import { VizFrame } from "./viz-frame";
import { VizTable, type RowTone } from "./viz-table";
import { useVizSteps } from "./use-viz-steps";

type SelfJoinVisual = Extract<Visual, { kind: "selfJoin" }>;

/**
 * Renders one table twice under two aliases and walks the pairs between them.
 *
 * The point being made is that the two aliases are independent cursors over
 * the same rows -- that is what lets a single query hold two rows at once.
 */
export function SelfJoinFlow({
  visual,
  table,
}: {
  visual: SelfJoinVisual;
  table: Table;
}) {
  const [aliasA, aliasB] = visual.aliases;
  const { pairs, keep } = visual;

  // 0 = one table, 1 = two aliases, 2.. = one pair each, then summary
  const count = pairs.length + 3;
  const { index, next, prev, reset, toggle, playing } = useVizSteps(count);

  const showBoth = index >= 1;
  const cursor = index >= 2 && index < pairs.length + 2 ? index - 2 : -1;
  const emitted = Math.max(0, Math.min(index - 1, pairs.length));
  const active = cursor >= 0 ? pairs[cursor] : null;

  const toneFor = (rowIndex: number, side: 0 | 1): RowTone => {
    if (active && active[side] === rowIndex) return side === 0 ? "active" : "info";
    return "idle";
  };

  const resultColumns = [
    ...table.columns.map((c) => `${aliasA}.${c}`),
    ...table.columns.map((c) => `${aliasB}.${c}`),
  ];
  const rightColumnIndices = table.columns.map((_, i) => table.columns.length + i);

  const resultRows: Cell[][] = pairs
    .slice(0, emitted)
    .map(([a, b]) => [...table.rows[a], ...table.rows[b]]);
  const resultTones: RowTone[] = pairs
    .slice(0, emitted)
    .map((_, p) => (keep.includes(p) ? "match" : "drop"));

  const caption = (() => {
    if (index === 0) {
      return `${table.name} has ${table.rows.length} rows, and no row knows anything about its neighbours.`;
    }
    if (index === 1) {
      return `Read the same table twice, as ${aliasA} and ${aliasB}. The aliases are what let one query compare two rows.`;
    }
    if (active) {
      const survives = keep.includes(cursor);
      const base = `Pair ${aliasA}[${active[0] + 1}] with ${aliasB}[${active[1] + 1}] — ${visual.condition}.`;
      if (!visual.where) return base;
      return survives
        ? `${base} It also satisfies ${visual.where}, so it is kept.`
        : `${base} But ${visual.where} is false here, so the pair is discarded.`;
    }
    return `${pairs.length} pairs satisfied the ON clause; ${keep.length} of those survived the WHERE.`;
  })();

  return (
    <VizFrame
      title="SELF JOIN"
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
            name={`${table.name} AS ${aliasA}`}
            columns={table.columns}
            rows={table.rows}
            tones={table.rows.map((_, i) => toneFor(i, 0))}
          />
          {showBoth ? (
            <VizTable
              name={`${table.name} AS ${aliasB}`}
              columns={table.columns}
              rows={table.rows}
              tones={table.rows.map((_, i) => toneFor(i, 1))}
              rightColumns={table.columns.map((_, i) => i)}
            />
          ) : (
            <div className="border-line-soft text-ink-subtle flex items-center justify-center rounded border border-dashed p-6 text-center">
              <span className="mono-label">second alias not read yet</span>
            </div>
          )}
        </div>

        <div className="border-line border-t pt-6">
          <VizTable
            name="paired rows"
            columns={resultColumns}
            rows={resultRows}
            tones={resultTones}
            rightColumns={rightColumnIndices}
            animateRows
            emptyLabel="no pairs yet"
          />
        </div>
      </div>
    </VizFrame>
  );
}
