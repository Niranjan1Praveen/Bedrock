import type { Problem } from "../types";

export const problem: Problem = {
  id: 620,
  slug: "not-boring-movies",
  title: "Not Boring Movies",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/not-boring-movies/",
  brief:
    "Cinema holds one row per movie showing, with an odd or even id and a one-word description.",
  ask: "Return the movies with an odd id whose description is not boring, best rating first.",
  concepts: ["SELECT", "WHERE", "ORDER BY"],
  tables: [
    {
      name: "Cinema",
      pk: "id",
      columns: ["id", "movie", "description", "rating"],
      rows: [
        [1, "War", "great 3D", 8.9],
        [2, "Science", "fiction", 8.5],
        [3, "irish", "boring", 6.2],
        [4, "Ice song", "Fantacy", 8.6],
        [5, "House card", "Interesting", 9.1],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["id", "movie", "description", "rating"],
    rows: [
      [5, "House card", "Interesting", 9.1],
      [1, "War", "great 3D", 8.9],
    ],
  },
  query: `SELECT *
FROM Cinema
WHERE id % 2 = 1
  AND description != 'boring'
ORDER BY rating DESC;`,
  keyIdea:
    "The modulo operator is the standard test for odd and even: id % 2 = 1 keeps the odd rows.",
  walkthrough: [
    {
      label: "id % 2 = 1",
      text: "Keeps ids 1, 3 and 5. Movies 2 and 4 are gone before the description is even considered.",
    },
    {
      label: "description != 'boring'",
      text: "Drops movie 3. The comparison is exact, so a description of 'Boring' with a capital B would survive in a case-sensitive collation.",
    },
    {
      label: "ORDER BY rating DESC",
      text: "Highest rating first, putting 9.1 above 8.9.",
    },
  ],
  gotcha:
    "This only works because description is never NULL here. Against a nullable column, != 'boring' silently drops the NULL rows too.",
  visual: {
    kind: "filter",
    table: "Cinema",
    predicate: "id % 2 = 1 AND description != 'boring'",
    keep: [0, 4],
  },
};
