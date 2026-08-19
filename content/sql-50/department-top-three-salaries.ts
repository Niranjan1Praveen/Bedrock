import type { Problem } from "../types";

export const problem: Problem = {
  id: 185,
  slug: "department-top-three-salaries",
  title: "Department Top Three Salaries",
  difficulty: "Hard",
  url: "https://leetcode.com/problems/department-top-three-salaries/",
  brief:
    "Employee holds staff and their salaries per department. A person is a high earner if fewer than three distinct salaries in their department beat theirs, so ties can push a department past three rows.",
  ask: "Report the high earners in every department.",
  concepts: ["WINDOW", "CTE", "INNER JOIN", "WHERE"],
  tables: [
    {
      name: "Employee",
      pk: "id",
      columns: ["id", "name", "salary", "departmentId"],
      rows: [
        [1, "Joe", 85000, 1],
        [2, "Henry", 80000, 2],
        [3, "Sam", 60000, 2],
        [4, "Max", 90000, 1],
        [5, "Janet", 69000, 1],
        [6, "Randy", 85000, 1],
        [7, "Will", 70000, 1],
      ],
    },
    {
      name: "Department",
      pk: "id",
      columns: ["id", "name"],
      rows: [
        [1, "IT"],
        [2, "Sales"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["Department", "Employee", "Salary"],
    rows: [
      ["IT", "Max", 90000],
      ["IT", "Joe", 85000],
      ["IT", "Randy", 85000],
      ["IT", "Will", 70000],
      ["Sales", "Henry", 80000],
      ["Sales", "Sam", 60000],
    ],
  },
  query: `WITH ranked AS (
    SELECT departmentId,
           name,
           salary,
           DENSE_RANK() OVER (
               PARTITION BY departmentId
               ORDER BY salary DESC
           ) AS rnk
    FROM Employee
)
SELECT d.name AS Department,
       r.name AS Employee,
       r.salary AS Salary
FROM ranked AS r
JOIN Department AS d ON d.id = r.departmentId
WHERE r.rnk <= 3;`,
  keyIdea:
    "DENSE_RANK is the right ranking function here because the definition counts distinct salaries. RANK and ROW_NUMBER both give the wrong answer on ties.",
  walkthrough: [
    {
      label: "PARTITION BY departmentId",
      text: "Ranking restarts inside each department. IT and Sales are numbered independently, and no row is collapsed the way GROUP BY would collapse it.",
    },
    {
      label: "ORDER BY salary DESC",
      text: "Highest paid takes rank 1. In IT that is Max on 90000.",
    },
    {
      label: "the tie",
      text: "Joe and Randy both earn 85000 and both take rank 2. DENSE_RANK then gives Will rank 3, so IT returns four people for three ranks.",
    },
    {
      label: "WHERE r.rnk <= 3",
      text: "Once the rank is an ordinary column, taking the top three is an ordinary filter. It has to sit outside the CTE, because a window function cannot appear in WHERE.",
    },
  ],
  gotcha:
    "RANK would skip to 4 after the tie and lose Will. ROW_NUMBER would break the tie arbitrarily and lose either Joe or Randy. Only DENSE_RANK matches the definition given.",
  visual: {
    kind: "windowRank",
    source: {
      name: "Employee",
      columns: ["name", "salary", "departmentId"],
      rows: [
        ["Joe", 85000, 1],
        ["Henry", 80000, 2],
        ["Sam", 60000, 2],
        ["Max", 90000, 1],
        ["Janet", 69000, 1],
        ["Randy", 85000, 1],
        ["Will", 70000, 1],
      ],
    },
    partitionBy: "departmentId",
    orderBy: "salary",
    fn: "DENSE_RANK",
    as: "rnk",
    keepUpTo: 3,
  },
};
