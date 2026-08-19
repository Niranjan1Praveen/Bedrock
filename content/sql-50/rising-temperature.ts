import type { Problem } from "../types";

export const problem: Problem = {
  id: 197,
  slug: "rising-temperature",
  title: "Rising Temperature",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/rising-temperature/",
  brief:
    "Weather records one temperature per date. Rows are independent -- nothing in a single row says what yesterday looked like.",
  ask: "Return the ids of dates whose temperature was higher than the previous day's.",
  concepts: ["SELF JOIN", "DATE", "WHERE"],
  tables: [
    {
      name: "Weather",
      pk: "id",
      columns: ["id", "recordDate", "temperature"],
      rows: [
        [1, "2015-01-01", 10],
        [2, "2015-01-02", 25],
        [3, "2015-01-03", 20],
        [4, "2015-01-04", 30],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["id"],
    rows: [[2], [4]],
  },
  query: `SELECT today.id
FROM Weather AS today
JOIN Weather AS yesterday
  ON DATEDIFF(today.recordDate, yesterday.recordDate) = 1
WHERE today.temperature > yesterday.temperature;`,
  keyIdea:
    "To compare a row against another row of the same table, join the table to itself under two aliases. Each alias behaves like an independent copy.",
  walkthrough: [
    {
      label: "two aliases",
      text: "today and yesterday are the same table read twice. The aliases are what let one query hold two different rows at once.",
    },
    {
      label: "ON DATEDIFF(...) = 1",
      text: "Pair each row with the row exactly one day earlier. Three such pairs exist across four days.",
    },
    {
      label: "WHERE today.temperature > yesterday.temperature",
      text: "Of those pairs, keep only the ones that rose: 10 to 25, and 20 to 30. The 25 to 20 pair is discarded.",
    },
    {
      label: "SELECT today.id",
      text: "Report the later date of each surviving pair.",
    },
  ],
  gotcha:
    "Comparing ids instead of dates (yesterday.id = today.id - 1) happens to work here, but breaks the moment ids are not sequential or a date is missing. Compare the dates.",
  visual: {
    kind: "selfJoin",
    table: "Weather",
    aliases: ["yesterday", "today"],
    condition: "today.recordDate is 1 day after yesterday.recordDate",
    pairs: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
    where: "today.temperature > yesterday.temperature",
    keep: [0, 2],
  },
};
