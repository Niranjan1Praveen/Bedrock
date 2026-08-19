import type { Table, Visual } from "@/content/types";
import { FilterFlow } from "./filter-flow";
import { JoinFlow } from "./join-flow";
import { SelfJoinFlow } from "./self-join-flow";
import { GroupByFlow } from "./group-by-flow";

/**
 * Maps a `Visual` onto its flow component.
 *
 * This stays a server component -- the flows themselves are the client
 * boundary -- so adding a visual kind means touching the `Visual` union and
 * this switch, and nothing else in the app.
 */
export function Viz({
  visual,
  tables,
}: {
  visual: Visual;
  tables: Table[];
}) {
  const find = (name: string) => tables.find((t) => t.name === name);

  switch (visual.kind) {
    case "filter": {
      const table = find(visual.table);
      if (!table) return null;
      return <FilterFlow visual={visual} table={table} />;
    }
    case "join": {
      const left = find(visual.left);
      const right = find(visual.right);
      if (!left || !right) return null;
      return <JoinFlow visual={visual} left={left} right={right} />;
    }
    case "selfJoin": {
      const table = find(visual.table);
      if (!table) return null;
      return <SelfJoinFlow visual={visual} table={table} />;
    }
    case "groupBy":
      return <GroupByFlow visual={visual} />;
  }
}
