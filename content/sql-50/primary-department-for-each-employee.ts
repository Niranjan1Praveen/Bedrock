import type { Problem } from "../types";

export const problem: Problem = {
  id: 1789,
  slug: "primary-department-for-each-employee",
  title: "Primary Department for Each Employee",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/primary-department-for-each-employee/",
  brief:
    "Employee holds one row per employee per department. Somebody in several departments has exactly one marked Y; somebody in a single department may be marked N.",
  ask: "Report each employee's primary department.",
  concepts: ["WHERE", "UNION", "GROUP BY", "HAVING", "AGGREGATE"],
  tables: [
    {
      name: "Employee",
      columns: ["employee_id", "department_id", "primary_flag"],
      rows: [
        [1, 1, "N"],
        [2, 1, "Y"],
        [2, 2, "N"],
        [3, 3, "N"],
        [4, 2, "N"],
        [4, 3, "Y"],
        [4, 4, "N"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["employee_id", "department_id"],
    rows: [
      [1, 1],
      [2, 1],
      [3, 3],
      [4, 3],
    ],
  },
  query: `SELECT employee_id, department_id
FROM Employee
WHERE primary_flag = 'Y'

UNION

SELECT employee_id, department_id
FROM Employee
GROUP BY employee_id
HAVING COUNT(*) = 1;`,
  keyIdea:
    "Two disjoint rules for the same output shape is what UNION is for. Each half is simple on its own; expressing both in one WHERE is not.",
  walkthrough: [
    {
      label: "the flagged half",
      text: "Employees 2 and 4 have an explicit Y, so their primary department is stated outright.",
    },
    {
      label: "the single-department half",
      text: "Employees 1 and 3 have one row each, marked N. Their only department is primary by default.",
    },
    {
      label: "UNION",
      text: "Combine the two result sets. UNION also deduplicates, though here the two halves cannot overlap.",
    },
  ],
  gotcha:
    "An employee in one department is not guaranteed to be flagged Y, which is why the first query alone misses employees 1 and 3.",
  visual: {
    kind: "filter",
    table: "Employee",
    predicate: "primary_flag = 'Y' OR it is the employee's only department",
    keep: [0, 1, 3, 5],
  },
};
