import type { Problem } from "../types";

export const problem: Problem = {
  id: 596,
  slug: "classes-more-than-5-students",
  title: "Classes More Than 5 Students",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/classes-more-than-5-students/",
  brief:
    "Courses holds one row per student per class they are enrolled in.",
  ask: "Return the classes with at least five students.",
  concepts: ["GROUP BY", "HAVING", "AGGREGATE"],
  tables: [
    {
      name: "Courses",
      columns: ["student", "class"],
      rows: [
        ["A", "Math"],
        ["B", "English"],
        ["C", "Math"],
        ["D", "Biology"],
        ["E", "Math"],
        ["F", "Computer"],
        ["G", "Math"],
        ["H", "Math"],
        ["I", "Math"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["class"],
    rows: [["Math"]],
  },
  query: `SELECT class
FROM Courses
GROUP BY class
HAVING COUNT(*) >= 5;`,
  keyIdea:
    "HAVING is WHERE for groups. It is the only place a condition on an aggregate can go.",
  walkthrough: [
    {
      label: "GROUP BY class",
      text: "Four buckets: Math with six students, and English, Biology and Computer with one each.",
    },
    {
      label: "HAVING COUNT(*) >= 5",
      text: "Only Math survives. WHERE cannot express this, because when WHERE runs the rows have not been grouped and no count exists.",
    },
  ],
  gotcha:
    "The comparison is at least five, not more than five, despite the problem title. Read the statement rather than the title.",
  visual: {
    kind: "groupBy",
    source: {
      name: "Courses",
      columns: ["class", "enrolled"],
      rows: [
        ["Math", 1],
        ["Math", 1],
        ["Math", 1],
        ["Math", 1],
        ["Math", 1],
        ["Math", 1],
        ["English", 1],
        ["Biology", 1],
        ["Computer", 1],
      ],
    },
    by: "class",
    agg: { fn: "SUM", column: "enrolled", as: "students" },
  },
};
