import type { Problem } from "../types";

export const problem: Problem = {
  id: 2356,
  slug: "number-of-unique-subjects-taught-by-each-teacher",
  title: "Number of Unique Subjects Taught by Each Teacher",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/number-of-unique-subjects-taught-by-each-teacher/",
  brief:
    "Teacher holds one row per subject a teacher covers in a department. The same subject taught in two departments appears twice.",
  ask: "Report how many distinct subjects each teacher covers.",
  concepts: ["GROUP BY", "AGGREGATE", "DISTINCT"],
  tables: [
    {
      name: "Teacher",
      columns: ["teacher_id", "subject_id", "dept_id"],
      rows: [
        [1, 2, 3],
        [1, 2, 4],
        [1, 3, 3],
        [2, 1, 1],
        [2, 2, 1],
        [2, 3, 1],
        [2, 4, 1],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["teacher_id", "cnt"],
    rows: [
      [1, 2],
      [2, 4],
    ],
  },
  query: `SELECT teacher_id, COUNT(DISTINCT subject_id) AS cnt
FROM Teacher
GROUP BY teacher_id;`,
  keyIdea:
    "DISTINCT inside an aggregate deduplicates within each group, not across the whole table.",
  walkthrough: [
    {
      label: "the duplicate",
      text: "Teacher 1 teaches subject 2 in departments 3 and 4. That is one subject recorded on two rows.",
    },
    {
      label: "COUNT(DISTINCT subject_id)",
      text: "Deduplicate inside teacher 1's bucket before counting, giving 2 rather than 3. Teacher 2 has no repeats, so their count is unaffected at 4.",
    },
    {
      label: "GROUP BY teacher_id",
      text: "One row out per teacher.",
    },
  ],
  gotcha:
    "Plain COUNT(*) returns 3 for teacher 1. The duplicate row is the entire point of the exercise.",
  visual: {
    kind: "groupBy",
    source: {
      name: "After deduplicating each teacher's subjects",
      columns: ["teacher_id", "subject_id"],
      rows: [
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
      ],
    },
    by: "teacher_id",
    agg: { fn: "COUNT", column: "subject_id", as: "cnt" },
  },
};
