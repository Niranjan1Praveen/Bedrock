import type { Problem } from "../types";

export const problem: Problem = {
  id: 1667,
  slug: "fix-names-in-a-table",
  title: "Fix Names in a Table",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/fix-names-in-a-table/",
  brief:
    "Users holds names with inconsistent capitalisation, entered however the user typed them.",
  ask: "Return each name with only the first letter capitalised, ordered by user id.",
  concepts: ["SELECT", "STRING", "ORDER BY"],
  tables: [
    {
      name: "Users",
      pk: "user_id",
      columns: ["user_id", "name"],
      rows: [
        [1, "aLice"],
        [2, "bOB"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["user_id", "name"],
    rows: [
      [1, "Alice"],
      [2, "Bob"],
    ],
  },
  query: `SELECT user_id,
       CONCAT(
         UPPER(LEFT(name, 1)),
         LOWER(SUBSTRING(name, 2))
       ) AS name
FROM Users
ORDER BY user_id;`,
  keyIdea:
    "Split the string, transform each part differently, then glue it back together. There is no single function for title case.",
  walkthrough: [
    {
      label: "LEFT(name, 1)",
      text: "The first character on its own, uppercased.",
    },
    {
      label: "SUBSTRING(name, 2)",
      text: "Everything from the second character onward, lowercased. SQL string positions start at 1, not 0.",
    },
    {
      label: "CONCAT",
      text: "Join the two halves back into one value.",
    },
  ],
  gotcha:
    "The tail must be lowercased explicitly. Uppercasing the first letter alone leaves bOB as BOB rather than Bob.",
};
