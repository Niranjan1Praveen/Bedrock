import type { Problem } from "../types";

export const problem: Problem = {
  id: 1378,
  slug: "replace-employee-id-with-the-unique-identifier",
  title: "Replace Employee ID With The Unique Identifier",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/",
  brief:
    "Employees holds every employee. EmployeeUNI maps some -- not all -- of those employees to a unique id.",
  ask: "Show each employee's unique id, or NULL when they do not have one.",
  concepts: ["LEFT JOIN", "NULL"],
  tables: [
    {
      name: "Employees",
      pk: "id",
      columns: ["id", "name"],
      rows: [
        [1, "Alice"],
        [7, "Bob"],
        [11, "Meir"],
        [90, "Winston"],
        [3, "Jonathan"],
      ],
    },
    {
      name: "EmployeeUNI",
      pk: "id",
      columns: ["id", "unique_id"],
      rows: [
        [3, 1],
        [11, 2],
        [90, 3],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["unique_id", "name"],
    rows: [
      [null, "Alice"],
      [null, "Bob"],
      [2, "Meir"],
      [3, "Winston"],
      [1, "Jonathan"],
    ],
  },
  query: `SELECT uni.unique_id, e.name
FROM Employees e
LEFT JOIN EmployeeUNI uni
  ON e.id = uni.id;`,
  keyIdea:
    "LEFT JOIN keeps every row of the left table. Where the right table has no match, its columns come back filled with NULL rather than the row disappearing.",
  walkthrough: [
    {
      label: "FROM Employees e",
      text: "Employees is the left table, so all five rows are guaranteed to appear in the output.",
    },
    {
      label: "LEFT JOIN EmployeeUNI uni",
      text: "For each employee, look for a row in EmployeeUNI with the same id. Meir, Winston and Jonathan match.",
    },
    {
      label: "unmatched rows",
      text: "Alice and Bob have no match. They are still emitted, with uni.unique_id set to NULL.",
    },
    {
      label: "SELECT uni.unique_id, e.name",
      text: "Project one column from each side. Five rows in, five rows out.",
    },
  ],
  gotcha:
    "Using a plain JOIN here silently drops Alice and Bob. The row count tells you: an inner join can shrink the left table, a left join never can.",
  visual: {
    kind: "join",
    type: "left",
    left: "Employees",
    right: "EmployeeUNI",
    on: ["id", "id"],
  },
};
