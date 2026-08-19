import type { Problem } from "../types";

export const problem: Problem = {
  id: 619,
  slug: "biggest-single-number",
  title: "Biggest Single Number",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/biggest-single-number/",
  brief:
    "MyNumbers holds a bag of integers. A number is single if it appears exactly once in the whole table.",
  ask: "Return the largest single number, or null if there is none.",
  concepts: ["GROUP BY", "HAVING", "AGGREGATE", "SUBQUERY", "NULL"],
  tables: [
    {
      name: "MyNumbers",
      columns: ["num"],
      rows: [[8], [8], [3], [3], [1], [4], [5], [6]],
    },
  ],
  expected: {
    name: "Result",
    columns: ["num"],
    rows: [[6]],
  },
  query: `SELECT MAX(num) AS num
FROM (
    SELECT num
    FROM MyNumbers
    GROUP BY num
    HAVING COUNT(*) = 1
) AS singles;`,
  keyIdea:
    "MAX over an empty set returns NULL rather than no rows at all, which is exactly the behaviour the null case needs.",
  walkthrough: [
    {
      label: "GROUP BY num HAVING COUNT(*) = 1",
      text: "Bucket by value and keep only the buckets holding one row. 8 and 3 appear twice and are discarded; 1, 4, 5 and 6 survive.",
    },
    {
      label: "MAX(num)",
      text: "The largest of the survivors is 6.",
    },
    {
      label: "why the outer query matters",
      text: "An aggregate with no GROUP BY always returns exactly one row. If nothing were single, that row would hold NULL, which is what the problem asks for.",
    },
  ],
  gotcha:
    "Using ORDER BY num DESC LIMIT 1 instead of MAX returns zero rows when there are no single numbers, where the problem wants one row containing null.",
  visual: {
    kind: "groupBy",
    source: {
      name: "MyNumbers",
      columns: ["num", "occurrence"],
      rows: [
        [8, 1],
        [8, 1],
        [3, 1],
        [3, 1],
        [1, 1],
        [4, 1],
        [5, 1],
        [6, 1],
      ],
    },
    by: "num",
    agg: { fn: "SUM", column: "occurrence", as: "times_seen" },
  },
};
