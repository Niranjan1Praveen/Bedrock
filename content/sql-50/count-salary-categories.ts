import type { Problem } from "../types";

export const problem: Problem = {
  id: 1907,
  slug: "count-salary-categories",
  title: "Count Salary Categories",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/count-salary-categories/",
  brief:
    "Accounts holds each bank account's monthly income. Incomes fall into three bands: below 20000, between 20000 and 50000, and above 50000.",
  ask: "Report how many accounts fall in each of the three categories, including categories with none.",
  concepts: ["UNION", "AGGREGATE", "WHERE", "CASE"],
  tables: [
    {
      name: "Accounts",
      pk: "account_id",
      columns: ["account_id", "income"],
      rows: [
        [3, 108939],
        [2, 12747],
        [8, 87709],
        [6, 91796],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["category", "accounts_count"],
    rows: [
      ["Low Salary", 1],
      ["Average Salary", 0],
      ["High Salary", 3],
    ],
  },
  query: `SELECT 'Low Salary' AS category, COUNT(*) AS accounts_count
FROM Accounts WHERE income < 20000

UNION ALL

SELECT 'Average Salary', COUNT(*)
FROM Accounts WHERE income BETWEEN 20000 AND 50000

UNION ALL

SELECT 'High Salary', COUNT(*)
FROM Accounts WHERE income > 50000;`,
  keyIdea:
    "GROUP BY can only produce a bucket for data that exists. When a category must appear even with a count of zero, the categories have to be written out rather than derived.",
  walkthrough: [
    {
      label: "three separate counts",
      text: "Each branch names its own category as a literal and counts the matching rows. The label does not come from the data.",
    },
    {
      label: "the empty band",
      text: "No account earns between 20000 and 50000. COUNT(*) with no matching rows still returns one row containing 0, which is exactly what is needed.",
    },
    {
      label: "UNION ALL",
      text: "ALL because the three rows are known to be distinct; plain UNION would pay for a needless deduplication.",
    },
  ],
  gotcha:
    "The natural GROUP BY solution, bucketing with CASE, returns only two rows. Average Salary vanishes entirely because no row falls in it, and the question specifically asks for the zero.",
  visual: {
    kind: "groupBy",
    source: {
      name: "What GROUP BY on a CASE would see",
      columns: ["account_id", "category", "account"],
      rows: [
        [2, "Low Salary", 1],
        [3, "High Salary", 1],
        [8, "High Salary", 1],
        [6, "High Salary", 1],
      ],
    },
    by: "category",
    agg: { fn: "SUM", column: "account", as: "accounts_count" },
  },
};
