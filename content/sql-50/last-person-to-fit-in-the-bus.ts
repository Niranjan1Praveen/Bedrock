import type { Problem } from "../types";

export const problem: Problem = {
  id: 1204,
  slug: "last-person-to-fit-in-the-bus",
  title: "Last Person to Fit in the Bus",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/last-person-to-fit-in-the-bus/",
  brief:
    "Queue holds people waiting to board in turn order, each with a weight. The bus can carry 1000 units in total and people board strictly by turn.",
  ask: "Find the last person who can board without the running total exceeding 1000.",
  concepts: ["WINDOW", "SUBQUERY", "ORDER BY", "LIMIT"],
  tables: [
    {
      name: "Queue",
      pk: "person_id",
      columns: ["person_id", "person_name", "weight", "turn"],
      rows: [
        [5, "Alice", 250, 1],
        [4, "Bob", 175, 5],
        [3, "Alex", 350, 2],
        [6, "John Cena", 400, 3],
        [1, "Winston", 500, 6],
        [2, "Marie", 200, 4],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["person_name"],
    rows: [["John Cena"]],
  },
  query: `SELECT person_name
FROM (
    SELECT person_name,
           SUM(weight) OVER (ORDER BY turn) AS cumulative
    FROM Queue
) AS boarding
WHERE cumulative <= 1000
ORDER BY cumulative DESC
LIMIT 1;`,
  keyIdea:
    "A window function with ORDER BY and no frame gives a running total. Every row keeps its identity and gains the total of everything up to and including itself.",
  walkthrough: [
    {
      label: "SUM(weight) OVER (ORDER BY turn)",
      text: "Alice 250, then Alex takes it to 600, then John Cena to 1000, then Marie to 1200.",
    },
    {
      label: "WHERE cumulative <= 1000",
      text: "Marie tips the bus over the limit, so she and everyone after her are excluded. John Cena lands exactly on 1000 and still fits.",
    },
    {
      label: "ORDER BY cumulative DESC LIMIT 1",
      text: "The last person to fit is the survivor with the largest running total.",
    },
  ],
  gotcha:
    "The row order in the table is not the boarding order. Everything here depends on ORDER BY turn, not on person_id or on how the rows happen to be stored.",
  visual: {
    kind: "filter",
    table: "Queue",
    predicate: "running total of weight, in turn order, stays <= 1000",
    keep: [0, 2, 3],
  },
};
