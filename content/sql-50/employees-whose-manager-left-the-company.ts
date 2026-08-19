import type { Problem } from "../types";

export const problem: Problem = {
  id: 1978,
  slug: "employees-whose-manager-left-the-company",
  title: "Employees Whose Manager Left the Company",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/employees-whose-manager-left-the-company/",
  brief:
    "Employees holds current staff. When somebody leaves, their row is deleted but the manager_id values pointing at them are left behind, dangling.",
  ask: "Find employees earning under 30000 whose manager is no longer in the table.",
  concepts: ["SUBQUERY", "WHERE", "NULL", "ORDER BY"],
  tables: [
    {
      name: "Employees",
      pk: "employee_id",
      columns: ["employee_id", "name", "manager_id", "salary"],
      rows: [
        [3, "Mila", 9, 60301],
        [12, "Antonella", null, 31000],
        [13, "Emery", null, 67084],
        [1, "Kalel", 11, 21241],
        [9, "Mikaela", null, 50937],
        [2, "Joziah", 6, 28485],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["employee_id"],
    rows: [[1], [2]],
  },
  query: `SELECT employee_id
FROM Employees
WHERE salary < 30000
  AND manager_id IS NOT NULL
  AND manager_id NOT IN (SELECT employee_id FROM Employees)
ORDER BY employee_id;`,
  keyIdea:
    "NOT IN against a subquery that can yield NULL returns UNKNOWN for every row, so the result comes back empty. Guarding the outer column is not enough on its own.",
  walkthrough: [
    {
      label: "salary < 30000",
      text: "Leaves Kalel at 21241 and Joziah at 28485.",
    },
    {
      label: "manager_id IS NOT NULL",
      text: "Employees with no manager have not lost one. This also keeps the NOT IN comparison meaningful.",
    },
    {
      label: "NOT IN (SELECT employee_id ...)",
      text: "Managers 11 and 6 are absent from the table, so both employees qualify. Mila's manager 9 is still present.",
    },
  ],
  gotcha:
    "employee_id is the primary key here, so the subquery cannot produce NULL and NOT IN is safe. Against a nullable column it would return nothing at all, and NOT EXISTS would be the correct tool.",
  visual: {
    kind: "filter",
    table: "Employees",
    predicate: "salary < 30000 AND manager_id no longer exists in the table",
    keep: [3, 5],
  },
};
