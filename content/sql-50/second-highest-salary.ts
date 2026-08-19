import type { Problem } from "../types";

export const problem: Problem = {
  id: 176,
  slug: "second-highest-salary",
  title: "Second Highest Salary",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/second-highest-salary/",
  brief:
    "Employee holds salaries, possibly with repeats. The second highest means the second distinct value, and it may not exist at all.",
  ask: "Return the second highest distinct salary, or null if there is not one.",
  concepts: ["SUBQUERY", "DISTINCT", "ORDER BY", "LIMIT", "NULL"],
  tables: [
    {
      name: "Employee",
      pk: "id",
      columns: ["id", "salary"],
      rows: [
        [1, 100],
        [2, 200],
        [3, 300],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["SecondHighestSalary"],
    rows: [[200]],
  },
  query: `SELECT (
    SELECT DISTINCT salary
    FROM Employee
    ORDER BY salary DESC
    LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`,
  keyIdea:
    "Wrapping the query in an outer SELECT guarantees exactly one row. A scalar subquery that finds nothing evaluates to NULL rather than returning no rows.",
  walkthrough: [
    {
      label: "DISTINCT salary",
      text: "Two people on the top salary must not make that salary count as both first and second.",
    },
    {
      label: "ORDER BY salary DESC",
      text: "Highest first, so the value wanted is the one immediately after the top.",
    },
    {
      label: "LIMIT 1 OFFSET 1",
      text: "Skip the highest, take the next. Here that is 200.",
    },
    {
      label: "the outer SELECT",
      text: "With only one employee the inner query returns nothing. The wrapper still emits a single row holding NULL, which is what the problem requires.",
    },
  ],
  gotcha:
    "Running the inner query on its own returns zero rows when there is no second salary, and the expected answer is one row containing null. The wrapper is not decoration.",
  visual: {
    kind: "windowRank",
    source: {
      name: "Employee",
      columns: ["id", "salary"],
      rows: [
        [1, 100],
        [2, 200],
        [3, 300],
      ],
    },
    orderBy: "salary",
    fn: "DENSE_RANK",
    as: "rnk",
    keepUpTo: 2,
  },
};
