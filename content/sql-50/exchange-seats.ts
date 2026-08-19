import type { Problem } from "../types";

export const problem: Problem = {
  id: 626,
  slug: "exchange-seats",
  title: "Exchange Seats",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/exchange-seats/",
  brief:
    "Seat holds students in consecutive, gapless seat ids. Swapping neighbours means students in seats 1 and 2 trade, 3 and 4 trade, and so on.",
  ask: "Swap every pair of adjacent students. If the count is odd, the last student stays put.",
  concepts: ["CASE", "SUBQUERY", "AGGREGATE", "ORDER BY"],
  tables: [
    {
      name: "Seat",
      pk: "id",
      columns: ["id", "student"],
      rows: [
        [1, "Abbot"],
        [2, "Doris"],
        [3, "Emerson"],
        [4, "Green"],
        [5, "Jeames"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["id", "student"],
    rows: [
      [1, "Doris"],
      [2, "Abbot"],
      [3, "Green"],
      [4, "Emerson"],
      [5, "Jeames"],
    ],
  },
  query: `SELECT
    CASE
        WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM Seat) THEN id
        WHEN id % 2 = 1 THEN id + 1
        ELSE id - 1
    END AS id,
    student
FROM Seat
ORDER BY id;`,
  keyIdea:
    "Rather than moving students between rows, rewrite each row's id and re-sort. The data never moves; only its label does.",
  walkthrough: [
    {
      label: "odd ids move up",
      text: "Seat 1 becomes 2, seat 3 becomes 4. Each odd seat takes the number of the neighbour above it.",
    },
    {
      label: "even ids move down",
      text: "Seat 2 becomes 1, seat 4 becomes 3. The two rules together are what performs the swap.",
    },
    {
      label: "the odd one out",
      text: "Seat 5 is odd and is also the highest id, so there is no partner to swap with. The first WHEN catches it and leaves the id alone.",
    },
    {
      label: "ORDER BY id",
      text: "The rewritten ids are out of order until this sorts them. Note the sort applies to the new id, not the original.",
    },
  ],
  gotcha:
    "Clause order matters inside CASE. If the plain odd rule came first, it would claim the last seat before the boundary rule ever ran and invent a seat that does not exist.",
};
