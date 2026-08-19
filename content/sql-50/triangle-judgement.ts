import type { Problem } from "../types";

export const problem: Problem = {
  id: 610,
  slug: "triangle-judgement",
  title: "Triangle Judgement",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/triangle-judgement/",
  brief:
    "Triangle holds three side lengths per row. Three lengths form a triangle only if each pair sums to more than the remaining side.",
  ask: "For every row, report whether the three lengths can form a triangle.",
  concepts: ["SELECT", "CASE"],
  tables: [
    {
      name: "Triangle",
      columns: ["x", "y", "z"],
      rows: [
        [13, 15, 30],
        [10, 20, 15],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["x", "y", "z", "triangle"],
    rows: [
      [13, 15, 30, "No"],
      [10, 20, 15, "Yes"],
    ],
  },
  query: `SELECT x, y, z,
       CASE WHEN x + y > z
             AND x + z > y
             AND y + z > x
            THEN 'Yes'
            ELSE 'No'
       END AS triangle
FROM Triangle;`,
  keyIdea:
    "CASE in the SELECT list labels rows instead of removing them. Every input row still comes back; it just gains a column.",
  walkthrough: [
    {
      label: "all three inequalities",
      text: "Checking only x + y > z is not enough in general. All three pairings must hold, so all three are written out.",
    },
    {
      label: "row one",
      text: "13 + 15 is 28, which is not greater than 30. The first condition already fails, so the answer is No.",
    },
    {
      label: "row two",
      text: "30 > 15, 25 > 20 and 35 > 10. All three hold, so Yes.",
    },
  ],
  gotcha:
    "This is a labelling problem, not a filtering one. Putting the condition in WHERE would drop the No rows, and the question asks for them.",
};
