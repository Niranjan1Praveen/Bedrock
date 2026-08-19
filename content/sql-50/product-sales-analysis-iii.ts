import type { Problem } from "../types";

export const problem: Problem = {
  id: 1070,
  slug: "product-sales-analysis-iii",
  title: "Product Sales Analysis III",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/product-sales-analysis-iii/",
  brief:
    "Sales records each sale of a product in a given year. A product may have sold in several years.",
  ask: "For each product, report the sales made in the first year it ever sold.",
  concepts: ["SUBQUERY", "GROUP BY", "AGGREGATE"],
  tables: [
    {
      name: "Sales",
      pk: "sale_id",
      columns: ["sale_id", "product_id", "year", "quantity", "price"],
      rows: [
        [1, 100, 2008, 10, 5000],
        [2, 100, 2009, 12, 5000],
        [7, 200, 2011, 15, 9000],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["product_id", "first_year", "quantity", "price"],
    rows: [
      [100, 2008, 10, 5000],
      [200, 2011, 15, 9000],
    ],
  },
  query: `SELECT product_id, year AS first_year, quantity, price
FROM Sales
WHERE (product_id, year) IN (
    SELECT product_id, MIN(year)
    FROM Sales
    GROUP BY product_id
);`,
  keyIdea:
    "To keep whole rows chosen by a per-group minimum, compute the minimum in a subquery and match the pair back. An aggregate alone cannot carry the other columns with it.",
  walkthrough: [
    {
      label: "MIN(year) per product",
      text: "Product 100 first sold in 2008, product 200 in 2011.",
    },
    {
      label: "(product_id, year) IN (...)",
      text: "Match on both columns together, so product 100 is only accepted for 2008 and not for any other product's first year.",
    },
    {
      label: "the outer SELECT",
      text: "Because the outer query reads whole rows, quantity and price come along untouched.",
    },
  ],
  gotcha:
    "SELECT product_id, MIN(year), quantity ... GROUP BY product_id looks simpler and is wrong: quantity is not part of the grouping, so the engine picks an arbitrary row for it. Strict mode rejects the query outright.",
  visual: {
    kind: "filter",
    table: "Sales",
    predicate: "(product_id, year) is that product's first selling year",
    keep: [0, 2],
  },
};
