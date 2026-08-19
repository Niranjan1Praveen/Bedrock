import type { Problem } from "../types";

export const problem: Problem = {
  id: 1661,
  slug: "average-time-of-process-per-machine",
  title: "Average Time of Process per Machine",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/average-time-of-process-per-machine/",
  brief:
    "Activity logs one row per event. A process produces two rows -- a 'start' and an 'end' -- and its duration is the gap between them.",
  ask: "Return the average processing time per machine, rounded to 3 decimal places.",
  concepts: ["SELF JOIN", "GROUP BY", "AGGREGATE", "ROUND"],
  tables: [
    {
      name: "Activity",
      columns: ["machine_id", "process_id", "activity_type", "timestamp"],
      rows: [
        [0, 0, "start", 0.712],
        [0, 0, "end", 1.52],
        [0, 1, "start", 3.14],
        [0, 1, "end", 4.12],
        [1, 0, "start", 0.55],
        [1, 0, "end", 1.55],
        [1, 1, "start", 0.43],
        [1, 1, "end", 1.42],
        [2, 0, "start", 4.1],
        [2, 0, "end", 4.512],
        [2, 1, "start", 2.5],
        [2, 1, "end", 5.0],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["machine_id", "processing_time"],
    rows: [
      [0, 0.894],
      [1, 0.995],
      [2, 1.456],
    ],
  },
  query: `SELECT
    s.machine_id,
    ROUND(AVG(e.timestamp - s.timestamp), 3) AS processing_time
FROM Activity AS s
JOIN Activity AS e
  ON s.machine_id = e.machine_id
 AND s.process_id = e.process_id
 AND s.activity_type = 'start'
 AND e.activity_type = 'end'
GROUP BY s.machine_id;`,
  keyIdea:
    "The self join turns two rows into one row holding both timestamps. Only then can a single expression compute the duration, and only then can GROUP BY average it.",
  walkthrough: [
    {
      label: "the shape problem",
      text: "A duration needs two timestamps, but each row has only one. No amount of aggregation fixes that -- the rows must be paired first.",
    },
    {
      label: "JOIN Activity s to Activity e",
      text: "Match a start row to the end row of the same machine and process. Six pairs come out, one per process.",
    },
    {
      label: "e.timestamp - s.timestamp",
      text: "Now that both timestamps sit in one row, the duration is ordinary arithmetic.",
    },
    {
      label: "GROUP BY s.machine_id",
      text: "Collapse the six durations into three buckets, one per machine, and AVG each bucket.",
    },
    {
      label: "ROUND(..., 3)",
      text: "Round the average, not the individual durations. Rounding early would drift the result.",
    },
  ],
  gotcha:
    "Putting the activity_type filters in a WHERE clause instead of the ON clause still works for an inner join, but breaks the moment you switch to a LEFT JOIN -- the WHERE runs after the join and discards the NULL-filled rows.",
  visual: {
    kind: "groupBy",
    source: {
      name: "After the join",
      columns: ["machine_id", "process_id", "duration"],
      rows: [
        [0, 0, 0.808],
        [0, 1, 0.98],
        [1, 0, 1.0],
        [1, 1, 0.99],
        [2, 0, 0.412],
        [2, 1, 2.5],
      ],
    },
    by: "machine_id",
    agg: { fn: "AVG", column: "duration", as: "processing_time" },
    round: 3,
  },
};
