import type { Problem } from "../types";

export const problem: Problem = {
  id: 570,
  slug: "managers-with-at-least-5-direct-reports",
  title: "Managers with at Least 5 Direct Reports",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/managers-with-at-least-5-direct-reports/",
  brief:
    "Employee holds every member of staff, with managerId pointing at another row of the same table. A NULL managerId means nobody manages them.",
  ask: "Return the names of managers with at least five direct reports.",
  concepts: ["SELF JOIN", "GROUP BY", "HAVING", "AGGREGATE", "SUBQUERY"],
  tables: [
    {
      name: "Employee",
      pk: "id",
      columns: ["id", "name", "department", "managerId"],
      rows: [
        [101, "John", "A", null],
        [102, "Dan", "A", 101],
        [103, "James", "A", 101],
        [104, "Amy", "A", 101],
        [105, "Anne", "A", 101],
        [106, "Ron", "B", 101],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["name"],
    rows: [["John"]],
  },
  query: `SELECT name
FROM Employee
WHERE id IN (
    SELECT managerId
    FROM Employee
    WHERE managerId IS NOT NULL
    GROUP BY managerId
    HAVING COUNT(*) >= 5
);`,
  keyIdea:
    "HAVING filters groups after aggregation; WHERE filters rows before it. A condition on COUNT can only live in HAVING.",
  walkthrough: [
    {
      label: "GROUP BY managerId",
      text: "Bucket the staff by who manages them. Five employees point at 101, so that bucket holds five rows.",
    },
    {
      label: "HAVING COUNT(*) >= 5",
      text: "Discard buckets that are too small. This has to be HAVING, because at the time WHERE runs no counts exist yet.",
    },
    {
      label: "WHERE id IN (...)",
      text: "The subquery yields manager ids, not names. The outer query looks each one back up in the same table to get the name.",
    },
  ],
  gotcha:
    "The subquery returns ids, so the outer query must match on id, not on managerId. Reading one table for two different purposes is what makes this feel harder than it is.",
  visual: {
    kind: "groupBy",
    source: {
      name: "Staff who report to someone",
      columns: ["id", "managerId", "reports"],
      rows: [
        [102, 101, 1],
        [103, 101, 1],
        [104, 101, 1],
        [105, 101, 1],
        [106, 101, 1],
      ],
    },
    by: "managerId",
    agg: { fn: "SUM", column: "reports", as: "direct_reports" },
  },
};
