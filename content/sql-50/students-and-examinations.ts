import type { Problem } from "../types";

export const problem: Problem = {
  id: 1280,
  slug: "students-and-examinations",
  title: "Students and Examinations",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/students-and-examinations/",
  brief:
    "Students lists every student, Subjects every subject, and Examinations one row per exam actually sat. A student who never sat a subject has no row at all.",
  ask: "For every student and every subject, report how many times that student sat that exam, including the zeroes.",
  concepts: ["CROSS JOIN", "LEFT JOIN", "GROUP BY", "AGGREGATE", "ORDER BY"],
  tables: [
    {
      name: "Students",
      pk: "student_id",
      columns: ["student_id", "student_name"],
      rows: [
        [1, "Alice"],
        [2, "Bob"],
        [13, "John"],
        [6, "Alex"],
      ],
    },
    {
      name: "Subjects",
      pk: "subject_name",
      columns: ["subject_name"],
      rows: [["Math"], ["Physics"], ["Programming"]],
    },
    {
      name: "Examinations",
      columns: ["student_id", "subject_name"],
      rows: [
        [1, "Math"],
        [1, "Physics"],
        [1, "Programming"],
        [2, "Programming"],
        [1, "Physics"],
        [1, "Math"],
        [13, "Math"],
        [13, "Programming"],
        [13, "Physics"],
        [2, "Math"],
        [1, "Math"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["student_id", "student_name", "subject_name", "attended_exams"],
    rows: [
      [1, "Alice", "Math", 3],
      [1, "Alice", "Physics", 2],
      [1, "Alice", "Programming", 1],
      [2, "Bob", "Math", 1],
      [2, "Bob", "Physics", 0],
      [2, "Bob", "Programming", 1],
      [6, "Alex", "Math", 0],
      [6, "Alex", "Physics", 0],
      [6, "Alex", "Programming", 0],
      [13, "John", "Math", 1],
      [13, "John", "Physics", 1],
      [13, "John", "Programming", 1],
    ],
  },
  query: `SELECT s.student_id,
       s.student_name,
       sub.subject_name,
       COUNT(e.student_id) AS attended_exams
FROM Students AS s
CROSS JOIN Subjects AS sub
LEFT JOIN Examinations AS e
  ON  e.student_id   = s.student_id
  AND e.subject_name = sub.subject_name
GROUP BY s.student_id, s.student_name, sub.subject_name
ORDER BY s.student_id, sub.subject_name;`,
  keyIdea:
    "When the answer must include rows that do not exist in the data, build the full grid first with a CROSS JOIN, then attach whatever data there is.",
  walkthrough: [
    {
      label: "CROSS JOIN",
      text: "4 students times 3 subjects gives all 12 required rows, with no condition at all. This is the skeleton the answer must fill.",
    },
    {
      label: "LEFT JOIN Examinations",
      text: "Attach the exams that were actually sat. Alex sat none, so all three of his rows stay NULL-filled.",
    },
    {
      label: "COUNT(e.student_id)",
      text: "Counting a specific column ignores NULLs, so Alex scores 0. COUNT(*) would count the NULL-filled row itself and wrongly return 1.",
    },
    {
      label: "GROUP BY three columns",
      text: "One output row per student-and-subject pair, which is exactly the grid built in step one.",
    },
  ],
  gotcha:
    "COUNT(*) instead of COUNT(e.student_id) turns every legitimate zero into a one. The choice of argument to COUNT is the whole problem.",
};
