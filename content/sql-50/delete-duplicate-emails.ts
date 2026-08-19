import type { Problem } from "../types";

export const problem: Problem = {
  id: 196,
  slug: "delete-duplicate-emails",
  title: "Delete Duplicate Emails",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/delete-duplicate-emails/",
  brief:
    "Person holds email addresses, some recorded more than once. This is the rare table question that mutates the data rather than reporting on it.",
  ask: "Delete the duplicates, keeping only the row with the smallest id for each address.",
  concepts: ["DELETE", "SELF JOIN"],
  tables: [
    {
      name: "Person",
      pk: "id",
      columns: ["id", "email"],
      rows: [
        [1, "john@example.com"],
        [2, "bob@example.com"],
        [3, "john@example.com"],
      ],
    },
  ],
  expected: {
    name: "Person, afterwards",
    columns: ["id", "email"],
    rows: [
      [1, "john@example.com"],
      [2, "bob@example.com"],
    ],
  },
  query: `DELETE p1
FROM Person AS p1
JOIN Person AS p2
  ON p1.email = p2.email
 AND p1.id    > p2.id;`,
  keyIdea:
    "A row is a duplicate precisely when another row exists with the same email and a smaller id. Self-joining on that condition selects exactly the rows to remove.",
  walkthrough: [
    {
      label: "DELETE p1",
      text: "Naming the alias is what tells the engine which side of the join to delete from. Without it the statement is ambiguous.",
    },
    {
      label: "p1.email = p2.email",
      text: "Pair each row with every other row sharing its address.",
    },
    {
      label: "p1.id > p2.id",
      text: "Keep only pairs where p1 is the later row. Row 3 pairs with row 1 and is deleted; row 1 finds nothing smaller and survives. This asymmetry is what stops both copies being removed.",
    },
  ],
  gotcha:
    "Joining on email alone deletes every copy including the one to keep. The strict inequality is doing all the work.",
  visual: {
    kind: "selfJoin",
    table: "Person",
    aliases: ["p1", "p2"],
    condition: "p1.email = p2.email and p1.id is the larger",
    pairs: [[2, 0]],
    where: "the paired p1 row is the one deleted",
    keep: [0],
  },
};
