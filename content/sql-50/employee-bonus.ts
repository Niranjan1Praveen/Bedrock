import type { Problem } from "../types";

export const problem: Problem = {
  id: 577,
  slug: "employee-bonus",
  title: "Employee Bonus",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/employee-bonus/",
  brief:
    "Employee holds staff records. Bonus holds a bonus for some of them; an employee missing from Bonus received none at all.",
  ask: "Report the name and bonus of every employee whose bonus is less than 1000, including those with no bonus.",
  concepts: ["LEFT JOIN", "NULL", "WHERE"],
  tables: [
    {
      name: "Employee",
      pk: "empId",
      columns: ["empId", "name", "supervisor", "salary"],
      rows: [
        [3, "Brad", null, 4000],
        [1, "John", 3, 1000],
        [2, "Dan", 3, 2000],
        [4, "Thomas", 3, 4000],
      ],
    },
    {
      name: "Bonus",
      pk: "empId",
      columns: ["empId", "bonus"],
      rows: [
        [2, 500],
        [4, 2000],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["name", "bonus"],
    rows: [
      ["Brad", null],
      ["John", null],
      ["Dan", 500],
    ],
  },
  query: `SELECT e.name, b.bonus
FROM Employee AS e
LEFT JOIN Bonus AS b
  ON e.empId = b.empId
WHERE b.bonus < 1000
   OR b.bonus IS NULL;`,
  keyIdea:
    "A LEFT JOIN produces NULLs, and NULL fails every comparison. Any filter applied afterwards has to say what it wants done with them.",
  walkthrough: [
    {
      label: "LEFT JOIN Bonus",
      text: "All four employees survive. Brad and John have no bonus row, so their bonus comes back NULL.",
    },
    {
      label: "b.bonus < 1000",
      text: "True for Dan at 500, false for Thomas at 2000, and UNKNOWN for Brad and John.",
    },
    {
      label: "OR b.bonus IS NULL",
      text: "Brings back the two employees with no bonus at all, which the question explicitly asks for.",
    },
  ],
  gotcha:
    "Doing the LEFT JOIN correctly and then writing only WHERE b.bonus < 1000 throws away exactly the employees the LEFT JOIN was for.",
  visual: {
    kind: "join",
    type: "left",
    left: "Employee",
    right: "Bonus",
    on: ["empId", "empId"],
  },
};
