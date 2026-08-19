import type { Problem } from "../types";

export const problem: Problem = {
  id: 1484,
  slug: "group-sold-products-by-the-date",
  title: "Group Sold Products By The Date",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/group-sold-products-by-the-date/",
  brief:
    "Activities holds one row per product sold per day, and the same product can be recorded twice on the same date.",
  ask: "For each day, report how many distinct products sold and their names as a sorted, comma-separated list.",
  concepts: ["GROUP BY", "AGGREGATE", "DISTINCT", "STRING", "ORDER BY"],
  tables: [
    {
      name: "Activities",
      columns: ["sell_date", "product"],
      rows: [
        ["2020-05-30", "Headphone"],
        ["2020-06-01", "Pencil"],
        ["2020-06-02", "Mask"],
        ["2020-05-30", "Basketball"],
        ["2020-06-01", "Bible"],
        ["2020-06-02", "Mask"],
        ["2020-05-30", "T-Shirt"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["sell_date", "num_sold", "products"],
    rows: [
      ["2020-05-30", 3, "Basketball,Headphone,T-Shirt"],
      ["2020-06-01", 2, "Bible,Pencil"],
      ["2020-06-02", 1, "Mask"],
    ],
  },
  query: `SELECT sell_date,
       COUNT(DISTINCT product) AS num_sold,
       GROUP_CONCAT(DISTINCT product ORDER BY product SEPARATOR ',')
         AS products
FROM Activities
GROUP BY sell_date
ORDER BY sell_date;`,
  keyIdea:
    "GROUP_CONCAT is an aggregate that returns a string instead of a number, and it takes its own ORDER BY inside the parentheses.",
  walkthrough: [
    {
      label: "GROUP BY sell_date",
      text: "Three buckets. The 2nd of June holds two rows, both Mask.",
    },
    {
      label: "COUNT(DISTINCT product)",
      text: "The 2nd of June sold one distinct product despite having two rows.",
    },
    {
      label: "GROUP_CONCAT(DISTINCT ... ORDER BY product)",
      text: "The sort lives inside the aggregate, because it orders values within a group rather than ordering the groups themselves.",
    },
  ],
  gotcha:
    "The outer ORDER BY sorts the days; the inner one sorts products inside each day. They are separate, and only the inner one can put Basketball before Headphone.",
  visual: {
    kind: "groupBy",
    source: {
      name: "Distinct product-days",
      columns: ["sell_date", "product"],
      rows: [
        ["2020-05-30", "Headphone"],
        ["2020-05-30", "Basketball"],
        ["2020-05-30", "T-Shirt"],
        ["2020-06-01", "Pencil"],
        ["2020-06-01", "Bible"],
        ["2020-06-02", "Mask"],
      ],
    },
    by: "sell_date",
    agg: { fn: "COUNT", column: "product", as: "num_sold" },
  },
};
