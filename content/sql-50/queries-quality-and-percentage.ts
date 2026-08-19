import type { Problem } from "../types";

export const problem: Problem = {
  id: 1211,
  slug: "queries-quality-and-percentage",
  title: "Queries Quality and Percentage",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/queries-quality-and-percentage/",
  brief:
    "Queries logs each search result, where it appeared in the list and how the user rated it. A rating below 3 is a poor result.",
  ask: "Per query name, report the quality (average of rating divided by position) and the percentage of poor results, both to 2 decimal places.",
  concepts: ["GROUP BY", "AGGREGATE", "CASE", "ROUND"],
  tables: [
    {
      name: "Queries",
      columns: ["query_name", "result", "position", "rating"],
      rows: [
        ["Dog", "Golden Retriever", 1, 5],
        ["Dog", "German Shepherd", 2, 5],
        ["Dog", "Mule", 200, 1],
        ["Cat", "Shirazi", 5, 2],
        ["Cat", "Siamese", 3, 3],
        ["Cat", "Sphynx", 7, 4],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["query_name", "quality", "poor_query_percentage"],
    rows: [
      ["Dog", "2.50", "33.33"],
      ["Cat", "0.66", "33.33"],
    ],
  },
  query: `SELECT query_name,
       ROUND(AVG(rating / position), 2) AS quality,
       ROUND(AVG(CASE WHEN rating < 3 THEN 1 ELSE 0 END) * 100, 2)
         AS poor_query_percentage
FROM Queries
GROUP BY query_name;`,
  keyIdea:
    "Two different aggregates over the same buckets in one pass. GROUP BY cuts the rows once; each aggregate then reduces those same rows its own way.",
  walkthrough: [
    {
      label: "rating / position",
      text: "Computed per row before aggregating. A great result high up scores well; the Mule at position 200 scores almost nothing.",
    },
    {
      label: "AVG(rating / position)",
      text: "The mean of the per-row ratios, not the ratio of the means. Dog averages 5, 2.5 and 0.005 to 2.50.",
    },
    {
      label: "AVG(CASE ...) * 100",
      text: "One poor result out of three is an average of 0.3333, which times 100 gives 33.33 for both queries.",
    },
  ],
  gotcha:
    "AVG(rating) / AVG(position) is a different number entirely. Dividing first and averaging second is what the definition of quality asks for.",
  visual: {
    kind: "groupBy",
    source: {
      name: "rating / position, per row",
      columns: ["query_name", "ratio"],
      rows: [
        ["Dog", 5],
        ["Dog", 2.5],
        ["Dog", 0.005],
        ["Cat", 0.4],
        ["Cat", 1],
        ["Cat", 0.5714],
      ],
    },
    by: "query_name",
    agg: { fn: "AVG", column: "ratio", as: "quality" },
    round: 2,
  },
};
