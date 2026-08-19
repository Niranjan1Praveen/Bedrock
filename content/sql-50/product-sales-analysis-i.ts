import type { Problem } from "../types";

export const problem: Problem = {
  id: 1068,
  slug: "product-sales-analysis-i",
  title: "Product Sales Analysis I",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/product-sales-analysis-i/",
  brief:
    "Sales records each sale by product id. Product holds the name for each product, including products that have never sold.",
  ask: "Report the product name, year and price for every sale.",
  concepts: ["INNER JOIN", "SELECT"],
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
    {
      name: "Product",
      pk: "product_id",
      columns: ["product_id", "product_name"],
      rows: [
        [100, "Nokia"],
        [200, "Apple"],
        [300, "Samsung"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["product_name", "year", "price"],
    rows: [
      ["Nokia", 2008, 5000],
      ["Nokia", 2009, 5000],
      ["Apple", 2011, 9000],
    ],
  },
  query: `SELECT p.product_name, s.year, s.price
FROM Sales AS s
JOIN Product AS p
  ON s.product_id = p.product_id;`,
  keyIdea:
    "An inner join keeps only keys present on both sides. Samsung has no sales and simply does not appear.",
  walkthrough: [
    {
      label: "JOIN ... ON",
      text: "Match each sale to its product by product_id. Both Nokia sales find their product row.",
    },
    {
      label: "Samsung",
      text: "Product 300 exists but has no matching sale, so an inner join drops it entirely. That is the correct behaviour here — the question asks about sales, not products.",
    },
    {
      label: "Nokia twice",
      text: "Product 100 has two sales, so the product row is paired twice. A join can grow the row count as well as shrink it.",
    },
  ],
  gotcha:
    "Joining is not deduplicating. One product row matching two sales produces two output rows, which is exactly what is wanted here but surprises people the first time.",
  visual: {
    kind: "join",
    type: "inner",
    left: "Sales",
    right: "Product",
    on: ["product_id", "product_id"],
  },
};
