import type { Problem } from "../types";

export const problem: Problem = {
  id: 1527,
  slug: "patients-with-a-condition",
  title: "Patients With a Condition",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/patients-with-a-condition/",
  brief:
    "Patients stores each patient's conditions as one space-separated string. Type I Diabetes codes start with the prefix DIAB1.",
  ask: "Find the patients who have Type I Diabetes.",
  concepts: ["WHERE", "STRING"],
  tables: [
    {
      name: "Patients",
      pk: "patient_id",
      columns: ["patient_id", "patient_name", "conditions"],
      rows: [
        [1, "Daniel", "YFEV COUGH"],
        [2, "Alice", ""],
        [3, "Bob", "DIAB100 MYOP"],
        [4, "George", "ACNE DIAB100"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["patient_id", "patient_name", "conditions"],
    rows: [
      [3, "Bob", "DIAB100 MYOP"],
      [4, "George", "ACNE DIAB100"],
    ],
  },
  query: `SELECT patient_id, patient_name, conditions
FROM Patients
WHERE conditions LIKE 'DIAB1%'
   OR conditions LIKE '% DIAB1%';`,
  keyIdea:
    "The prefix has to be anchored to the start of a word. Two patterns are needed because the first condition in the string has no space in front of it.",
  walkthrough: [
    {
      label: "LIKE 'DIAB1%'",
      text: "Catches Bob, whose string begins with the code.",
    },
    {
      label: "OR LIKE '% DIAB1%'",
      text: "Catches George, where the code follows a space. The space is what makes this a word boundary rather than a substring match.",
    },
    {
      label: "why not a single pattern",
      text: "LIKE '%DIAB1%' alone would also match a code such as SADIAB100, which is a different condition entirely.",
    },
  ],
  gotcha:
    "Storing a list inside one column is what makes this awkward. A properly normalised schema would put one condition per row and reduce this to an equality test.",
  visual: {
    kind: "filter",
    table: "Patients",
    predicate: "conditions contains a word starting with DIAB1",
    keep: [2, 3],
  },
};
