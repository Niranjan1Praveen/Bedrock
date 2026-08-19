import type { Problem } from "../types";

export const problem: Problem = {
  id: 584,
  slug: "find-customer-referee",
  title: "Find Customer Referee",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/find-customer-referee/",
  brief:
    "Each customer may have been referred by another customer. referee_id holds that referrer, or NULL if nobody referred them.",
  ask: "Return the names of customers not referred by the customer with id = 2.",
  concepts: ["SELECT", "WHERE", "NULL"],
  tables: [
    {
      name: "Customer",
      pk: "id",
      columns: ["id", "name", "referee_id"],
      rows: [
        [1, "Will", null],
        [2, "Jane", null],
        [3, "Alex", 2],
        [4, "Bill", null],
        [5, "Zack", 1],
        [6, "Mark", 2],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["name"],
    rows: [["Will"], ["Jane"], ["Bill"], ["Zack"]],
  },
  query: `SELECT name
FROM Customer
WHERE referee_id <> 2
   OR referee_id IS NULL;`,
  keyIdea:
    "Any comparison with NULL returns UNKNOWN, not true. WHERE keeps only true rows, so NULLs are silently dropped unless you ask for them explicitly.",
  walkthrough: [
    {
      label: "referee_id <> 2",
      text: "True for Zack (referred by 1). False for Alex and Mark (referred by 2). For the three NULL rows it is neither -- it is UNKNOWN.",
    },
    {
      label: "OR referee_id IS NULL",
      text: "IS NULL is the only operator that tests for NULL and returns a real true or false. This recovers Will, Jane and Bill.",
    },
    {
      label: "SELECT name",
      text: "Four rows survive; project their names.",
    },
  ],
  gotcha:
    "Writing only WHERE referee_id <> 2 returns just Zack. It looks correct and is the single most common SQL bug there is.",
  visual: {
    kind: "filter",
    table: "Customer",
    predicate: "referee_id <> 2",
    keep: [4],
    unknown: [0, 1, 3],
  },
};
