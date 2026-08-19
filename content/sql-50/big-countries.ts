import type { Problem } from "../types";

export const problem: Problem = {
  id: 595,
  slug: "big-countries",
  title: "Big Countries",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/big-countries/",
  brief:
    "A World table holds one row per country with its area and population. A country counts as big if it is large by either measure.",
  ask: "Return the name, population and area of every big country: area at least 3,000,000 or population at least 25,000,000.",
  concepts: ["SELECT", "WHERE"],
  tables: [
    {
      name: "World",
      pk: "name",
      columns: ["name", "continent", "area", "population"],
      rows: [
        ["Afghanistan", "Asia", 652230, 25500100],
        ["Albania", "Europe", 28748, 2831741],
        ["Algeria", "Africa", 2381741, 37100000],
        ["Andorra", "Europe", 468, 78115],
        ["Angola", "Africa", 1246700, 20609294],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["name", "population", "area"],
    rows: [
      ["Afghanistan", 25500100, 652230],
      ["Algeria", 37100000, 2381741],
    ],
  },
  query: `SELECT name, population, area
FROM World
WHERE area >= 3000000
   OR population >= 25000000;`,
  keyIdea:
    "OR keeps a row when either side is true. Where AND narrows the result, OR widens it.",
  walkthrough: [
    {
      label: "area >= 3000000",
      text: "True for Algeria alone. Afghanistan is only 652,230 square kilometres.",
    },
    {
      label: "OR population >= 25000000",
      text: "Rescues Afghanistan on population. Algeria satisfies both, but a row is still emitted once.",
    },
    {
      label: "SELECT",
      text: "Project the three requested columns, in the requested order — note that population is asked for before area.",
    },
  ],
  gotcha:
    "A row matching both conditions is not returned twice. WHERE is a test applied to each row once, not a pair of separate filters unioned together.",
  visual: {
    kind: "filter",
    table: "World",
    predicate: "area >= 3000000 OR population >= 25000000",
    keep: [0, 2],
  },
};
