import type { Cell, Table } from "@/content/types";

/**
 * Static table for schema and expected-output display.
 *
 * Deliberately a server component with no JavaScript -- only the animated
 * VizTable inside a visualization needs to be interactive.
 */
export function DataTable({ table }: { table: Table }) {
  return (
    <div className="min-w-0">
      <p className="mono-label text-ink-subtle mb-2.5">{table.name}</p>
      <div className="scroll-x border-line bg-surface rounded-lg border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-line bg-surface-2 border-b">
              {table.columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={`mono-label px-3 py-2.5 whitespace-nowrap ${
                    col === table.pk ? "text-ink" : "text-ink-subtle"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr
                key={r}
                className="border-line-soft border-b last:border-b-0"
              >
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className="text-ink px-3 py-2 font-mono text-[13px] whitespace-nowrap tabular-nums"
                  >
                    <CellValue value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CellValue({ value }: { value: Cell }) {
  if (value === null) return <span className="mono-label text-warn">null</span>;
  return <>{String(value)}</>;
}
