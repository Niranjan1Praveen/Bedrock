import type { Problem } from "../types";

export const problem: Problem = {
  id: 180,
  slug: "consecutive-numbers",
  title: "Consecutive Numbers",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/consecutive-numbers/",
  brief:
    "Logs holds a sequence of numbers keyed by an increasing id. Runs of the same value show up as consecutive ids.",
  ask: "Return the numbers that appear at least three times in a row.",
  concepts: ["SELF JOIN", "DISTINCT"],
  tables: [
    {
      name: "Logs",
      pk: "id",
      columns: ["id", "num"],
      rows: [
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 2],
        [5, 1],
        [6, 2],
        [7, 2],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["ConsecutiveNums"],
    rows: [[1]],
  },
  query: `SELECT DISTINCT l1.num AS ConsecutiveNums
FROM Logs AS l1
JOIN Logs AS l2
  ON l2.id = l1.id + 1 AND l2.num = l1.num
JOIN Logs AS l3
  ON l3.id = l1.id + 2 AND l3.num = l1.num;`,
  keyIdea:
    "To look at three rows at once, join the table to itself twice. Each alias is a window onto a different offset in the sequence.",
  walkthrough: [
    {
      label: "l1 and l2",
      text: "Pair each row with the next id, keeping only pairs with the same value. Ids 1 and 2 match, 2 and 3 match, and 6 and 7 match.",
    },
    {
      label: "and l3",
      text: "Demand a third row two ids along with the same value. Only the run starting at id 1 survives, since 6 and 7 have no id 8.",
    },
    {
      label: "DISTINCT",
      text: "A longer run produces several overlapping matches, all reporting the same number. DISTINCT collapses them.",
    },
  ],
  gotcha:
    "This relies on ids being consecutive with no gaps. If ids could skip, the arithmetic on id would silently miss real runs and a window function would be the safer tool.",
  visual: {
    kind: "selfJoin",
    table: "Logs",
    aliases: ["l1", "l2"],
    condition: "l2.id = l1.id + 1 and both rows hold the same num",
    pairs: [
      [0, 1],
      [1, 2],
      [5, 6],
    ],
    where: "a third row at l1.id + 2 also holds that num",
    keep: [0],
  },
};
