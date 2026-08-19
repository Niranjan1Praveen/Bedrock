/**
 * The content contract.
 *
 * Every field here is plain serialisable data, so a `Problem` maps 1:1 onto a
 * future database row without any rewriting of the authored content. Sample
 * rows are structured arrays rather than prose precisely so the *same* data
 * can feed both the rendered schema table and the animation beside it.
 */

export const CONCEPTS = [
  "SELECT",
  "WHERE",
  "DISTINCT",
  "INNER JOIN",
  "LEFT JOIN",
  "SELF JOIN",
  "CROSS JOIN",
  "UNION",
  "GROUP BY",
  "HAVING",
  "AGGREGATE",
  "WINDOW",
  "SUBQUERY",
  "CTE",
  "CASE",
  "NULL",
  "STRING",
  "REGEX",
  "DATE",
  "ROUND",
  "ORDER BY",
  "LIMIT",
  "DELETE",
] as const;

export type ConceptTag = (typeof CONCEPTS)[number];

export type Cell = string | number | null;

export interface Table {
  name: string;
  columns: string[];
  rows: Cell[][];
  /** Column name to emphasise as the key in schema rendering. */
  pk?: string;
}

/**
 * The animation spec. `kind` selects the flow component; the rest is that
 * component's props. Adding a new kind touches this union and the registry in
 * components/viz/index.tsx, nothing else.
 */
export type Visual =
  | {
      kind: "filter";
      /** Name of a table in `Problem.tables`. */
      table: string;
      predicate: string;
      /** Row indices the predicate keeps. */
      keep: number[];
      /**
       * Row indices where the predicate evaluates to UNKNOWN rather than
       * true/false -- i.e. the NULL trap. Rendered in warn yellow and dropped.
       */
      unknown?: number[];
    }
  | {
      kind: "join";
      type: "inner" | "left" | "right" | "full";
      /** Names of tables in `Problem.tables`. */
      left: string;
      right: string;
      /** [leftColumn, rightColumn] -- matches are computed from the data. */
      on: [string, string];
    }
  | {
      kind: "selfJoin";
      table: string;
      aliases: [string, string];
      /** The ON clause, in words. */
      condition: string;
      /** [leftRow, rightRow] index pairs that satisfy the ON clause. */
      pairs: [number, number][];
      /** The WHERE clause applied after the join, in words. */
      where?: string;
      /** Indices *into `pairs`* that survive `where`. */
      keep: number[];
    }
  | {
      kind: "windowRank";
      /** Inline source, since ranking usually runs over a joined projection. */
      source: Table;
      /** Column the rows are partitioned by, or omitted for one partition. */
      partitionBy?: string;
      /** Column the ranking is ordered by, highest first. */
      orderBy: string;
      fn: "RANK" | "DENSE_RANK" | "ROW_NUMBER";
      as: string;
      /** Highlight rows at or below this rank, to show the final filter. */
      keepUpTo?: number;
    }
  | {
      kind: "groupBy";
      /**
       * Inline source table rather than a schema reference, because grouping
       * often runs over an intermediate result (e.g. a post-join projection)
       * that never appears in the original schema.
       */
      source: Table;
      by: string;
      agg: { fn: "AVG" | "SUM" | "COUNT" | "MAX" | "MIN"; column: string; as: string };
      /** Decimal places to round the aggregate to, if any. */
      round?: number;
    };

export interface WalkthroughStep {
  /** The SQL clause or fragment being explained, e.g. "LEFT JOIN". */
  label: string;
  text: string;
}

export interface Problem {
  /** LeetCode problem number. */
  id: number;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
  /** One or two sentences restating the problem. */
  brief: string;
  /** The single thing being asked for. */
  ask: string;
  concepts: ConceptTag[];
  tables: Table[];
  expected: Table;
  query: string;
  /** The one line worth committing to memory. */
  keyIdea: string;
  walkthrough: WalkthroughStep[];
  /** The mistake actually worth warning about. Omit if there isn't one. */
  gotcha?: string;
  /** Study-plan section, attached by the track index rather than authored. */
  section?: string;
  visual?: Visual;
}

export interface Track {
  id: string;
  title: string;
  blurb: string;
  status: "active" | "planned";
  /** Total problems the track will eventually hold. */
  total: number;
}
