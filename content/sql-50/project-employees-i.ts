import type { Problem } from "../types";

export const problem: Problem = {
  id: 1075,
  slug: "project-employees-i",
  title: "Project Employees I",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/project-employees-i/",
  brief:
    "Project links employees to projects. Employee holds each person's years of experience. An employee can be on more than one project.",
  ask: "Report the average experience years of the employees on each project, rounded to 2 decimal places.",
  concepts: ["INNER JOIN", "GROUP BY", "AGGREGATE", "ROUND"],
  tables: [
    {
      name: "Project",
      columns: ["project_id", "employee_id"],
      rows: [
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 4],
      ],
    },
    {
      name: "Employee",
      pk: "employee_id",
      columns: ["employee_id", "name", "experience_years"],
      rows: [
        [1, "Khaled", 3],
        [2, "Ali", 2],
        [3, "John", 1],
        [4, "Doe", 2],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["project_id", "average_years"],
    rows: [
      [1, "2.00"],
      [2, "2.50"],
    ],
  },
  query: `SELECT p.project_id,
       ROUND(AVG(e.experience_years), 2) AS average_years
FROM Project AS p
JOIN Employee AS e
  ON p.employee_id = e.employee_id
GROUP BY p.project_id;`,
  keyIdea:
    "Join first to bring the values next to the grouping key, then aggregate. The join decides what is in each bucket; GROUP BY decides how the buckets are cut.",
  walkthrough: [
    {
      label: "JOIN",
      text: "Attach each assignment to that employee's experience. Khaled appears twice, once per project, which is correct.",
    },
    {
      label: "GROUP BY p.project_id",
      text: "Project 1 collects 3, 2 and 1; project 2 collects 3 and 2.",
    },
    {
      label: "ROUND(AVG(...), 2)",
      text: "Project 1 averages to 2.00, project 2 to 2.50. Both are padded to two decimal places.",
    },
  ],
  gotcha:
    "Grouping by employee instead of project inverts the question. The grouping key is whatever the answer has one row per.",
  visual: {
    kind: "groupBy",
    source: {
      name: "After the join",
      columns: ["project_id", "employee_id", "experience_years"],
      rows: [
        [1, 1, 3],
        [1, 2, 2],
        [1, 3, 1],
        [2, 1, 3],
        [2, 4, 2],
      ],
    },
    by: "project_id",
    agg: { fn: "AVG", column: "experience_years", as: "average_years" },
    round: 2,
  },
};
