import type { Problem } from "../types";

export const problem: Problem = {
  id: 585,
  slug: "investments-in-2016",
  title: "Investments in 2016",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/investments-in-2016/",
  brief:
    "Insurance holds policies with their 2015 and 2016 values, plus the location of the policyholder.",
  ask: "Sum the 2016 values of policies that share their 2015 value with another policy, but whose location is unique.",
  concepts: ["SUBQUERY", "GROUP BY", "HAVING", "AGGREGATE", "ROUND"],
  tables: [
    {
      name: "Insurance",
      pk: "pid",
      columns: ["pid", "tiv_2015", "tiv_2016", "lat", "lon"],
      rows: [
        [1, 10, 5, 10, 10],
        [2, 20, 20, 20, 20],
        [3, 10, 30, 20, 20],
        [4, 10, 40, 40, 40],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["tiv_2016"],
    rows: [["45.00"]],
  },
  query: `SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016
FROM Insurance
WHERE tiv_2015 IN (
    SELECT tiv_2015
    FROM Insurance
    GROUP BY tiv_2015
    HAVING COUNT(*) > 1
)
AND (lat, lon) IN (
    SELECT lat, lon
    FROM Insurance
    GROUP BY lat, lon
    HAVING COUNT(*) = 1
);`,
  keyIdea:
    "Two independent conditions, each written as a grouped subquery: one asks for a value that repeats, the other for a value that does not.",
  walkthrough: [
    {
      label: "shared tiv_2015",
      text: "Policies 1, 3 and 4 all have 10, so all three pass. Policy 2 has 20 to itself and is out.",
    },
    {
      label: "unique location",
      text: "Policies 2 and 3 both sit at 20, 20, so policy 3 is eliminated. Policies 1 and 4 are alone at their coordinates.",
    },
    {
      label: "SUM(tiv_2016)",
      text: "Only policies 1 and 4 satisfy both conditions, giving 5 plus 40, or 45.00.",
    },
  ],
  gotcha:
    "The location test is on the pair of columns together, not on lat and lon separately. Two policies could share a latitude while sitting in entirely different places.",
  visual: {
    kind: "filter",
    table: "Insurance",
    predicate: "tiv_2015 is shared AND the location is unique",
    keep: [0, 3],
  },
};
