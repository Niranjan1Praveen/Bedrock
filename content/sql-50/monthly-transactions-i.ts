import type { Problem } from "../types";

export const problem: Problem = {
  id: 1193,
  slug: "monthly-transactions-i",
  title: "Monthly Transactions I",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/monthly-transactions-i/",
  brief:
    "Transactions logs each card transaction with its country, its state of approved or declined, and the date it happened.",
  ask: "For each month and country, report the number of transactions and their total amount, alongside the same two figures for approved transactions only.",
  concepts: ["GROUP BY", "AGGREGATE", "CASE", "DATE"],
  tables: [
    {
      name: "Transactions",
      pk: "id",
      columns: ["id", "country", "state", "amount", "trans_date"],
      rows: [
        [121, "US", "approved", 1000, "2018-12-18"],
        [122, "US", "declined", 2000, "2018-12-19"],
        [123, "US", "approved", 2000, "2019-01-01"],
        [124, "DE", "approved", 2000, "2019-01-07"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: [
      "month",
      "country",
      "trans_count",
      "approved_count",
      "trans_total_amount",
      "approved_total_amount",
    ],
    rows: [
      ["2018-12", "US", 2, 1, 3000, 1000],
      ["2019-01", "US", 1, 1, 2000, 2000],
      ["2019-01", "DE", 1, 1, 2000, 2000],
    ],
  },
  query: `SELECT DATE_FORMAT(trans_date, '%Y-%m') AS month,
       country,
       COUNT(*) AS trans_count,
       SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END)
         AS approved_count,
       SUM(amount) AS trans_total_amount,
       SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END)
         AS approved_total_amount
FROM Transactions
GROUP BY month, country;`,
  keyIdea:
    "SUM over a CASE is conditional aggregation: it counts or totals only the rows that match, without needing a second query or a join.",
  walkthrough: [
    {
      label: "DATE_FORMAT(trans_date, '%Y-%m')",
      text: "Collapse each date to its month, so 2018-12-18 and 2018-12-19 land in the same bucket.",
    },
    {
      label: "GROUP BY month, country",
      text: "Two columns as the key, so US in December is a different bucket from US in January.",
    },
    {
      label: "COUNT(*) versus SUM(CASE ...)",
      text: "COUNT(*) counts every row in the bucket; the SUM adds 1 only for approved rows. December in the US gives 2 and 1.",
    },
    {
      label: "SUM(CASE ... THEN amount ELSE 0 END)",
      text: "The same trick for money: 3000 total against 1000 approved, because the declined 2000 contributes zero.",
    },
  ],
  gotcha:
    "Filtering approved rows in WHERE would make trans_count and approved_count identical. The unapproved rows must survive into the group and be excluded inside the aggregate instead.",
};
