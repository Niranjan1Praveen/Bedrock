import type { Problem } from "../types";

export const problem: Problem = {
  id: 1581,
  slug: "customer-who-visited-but-did-not-make-any-transactions",
  title: "Customer Who Visited but Did Not Make Any Transactions",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/",
  brief:
    "Visits logs every visit to the mall. Transactions logs purchases, linked back to the visit that produced them. A visit with no matching transaction was a browse.",
  ask: "For each customer, count how many visits ended without any transaction.",
  concepts: ["LEFT JOIN", "NULL", "GROUP BY", "AGGREGATE"],
  tables: [
    {
      name: "Visits",
      pk: "visit_id",
      columns: ["visit_id", "customer_id"],
      rows: [
        [1, 23],
        [2, 9],
        [4, 30],
        [5, 54],
        [6, 96],
        [7, 54],
        [8, 54],
      ],
    },
    {
      name: "Transactions",
      pk: "transaction_id",
      columns: ["transaction_id", "visit_id", "amount"],
      rows: [
        [2, 5, 310],
        [3, 5, 300],
        [9, 5, 200],
        [12, 1, 910],
        [13, 2, 970],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["customer_id", "count_no_trans"],
    rows: [
      [30, 1],
      [54, 2],
      [96, 1],
    ],
  },
  query: `SELECT v.customer_id, COUNT(*) AS count_no_trans
FROM Visits AS v
LEFT JOIN Transactions AS t
  ON v.visit_id = t.visit_id
WHERE t.transaction_id IS NULL
GROUP BY v.customer_id;`,
  keyIdea:
    "LEFT JOIN then WHERE ... IS NULL is the anti-join: keep everything on the left, then keep only the rows that failed to match.",
  walkthrough: [
    {
      label: "LEFT JOIN",
      text: "Every visit survives. Visits 1, 2 and 5 find transactions; visits 4, 6, 7 and 8 come back NULL-filled.",
    },
    {
      label: "WHERE t.transaction_id IS NULL",
      text: "Keep only the NULL-filled rows — the visits with no purchase. This filter is what turns the join into an anti-join.",
    },
    {
      label: "GROUP BY v.customer_id",
      text: "Customer 54 browsed on visits 7 and 8, so their two rows collapse into one with a count of 2.",
    },
  ],
  gotcha:
    "Putting that condition in the ON clause instead of WHERE breaks it completely: ON filters what is allowed to match, so every visit would come back unmatched and every customer would be counted.",
  visual: {
    kind: "join",
    type: "left",
    left: "Visits",
    right: "Transactions",
    on: ["visit_id", "visit_id"],
  },
};
