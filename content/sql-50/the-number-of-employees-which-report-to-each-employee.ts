import type { Problem } from "../types";

export const problem: Problem = {
  id: 1731,
  slug: "the-number-of-employees-which-report-to-each-employee",
  title: "The Number of Employees Which Report to Each Employee",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/the-number-of-employees-which-report-to-each-employee/",
  brief:
    "Employees holds every member of staff, with reports_to pointing at another row of the same table. Managers are simply the people somebody points at.",
  ask: "For each manager, report how many people report to them and the rounded average age of those reports.",
  concepts: ["SELF JOIN", "GROUP BY", "AGGREGATE", "ROUND", "ORDER BY"],
  tables: [
    {
      name: "Employees",
      pk: "employee_id",
      columns: ["employee_id", "name", "reports_to", "age"],
      rows: [
        [9, "Hercy", null, 43],
        [6, "Alice", 9, 41],
        [4, "Bob", 9, 36],
        [2, "Winston", null, 37],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["employee_id", "name", "reports_count", "average_age"],
    rows: [[9, "Hercy", 2, 39]],
  },
  query: `SELECT m.employee_id,
       m.name,
       COUNT(e.employee_id) AS reports_count,
       ROUND(AVG(e.age)) AS average_age
FROM Employees AS m
JOIN Employees AS e
  ON e.reports_to = m.employee_id
GROUP BY m.employee_id, m.name
ORDER BY m.employee_id;`,
  keyIdea:
    "One table read twice under two aliases becomes a manager side and a report side. The inner join then quietly removes anyone who manages nobody.",
  walkthrough: [
    {
      label: "two aliases",
      text: "m is the manager, e is the report. Both are the same four rows read separately.",
    },
    {
      label: "ON e.reports_to = m.employee_id",
      text: "Alice and Bob both point at 9, so both pair with Hercy. Winston manages nobody and never appears on the m side of a match.",
    },
    {
      label: "GROUP BY the manager",
      text: "Hercy's two pairs collapse into one row with a count of 2.",
    },
    {
      label: "ROUND(AVG(e.age))",
      text: "Ages 41 and 36 average to 38.5, which rounds to 39. No decimal places are requested here.",
    },
  ],
  gotcha:
    "Averaging m.age instead of e.age gives the manager's own age. When both sides are the same table, the alias on each column is what carries the meaning.",
  visual: {
    kind: "selfJoin",
    table: "Employees",
    aliases: ["manager", "report"],
    condition: "report.reports_to = manager.employee_id",
    pairs: [
      [0, 1],
      [0, 2],
    ],
    keep: [0, 1],
  },
};
