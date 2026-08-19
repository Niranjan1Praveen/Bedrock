import type { Problem } from "../types";

export const problem: Problem = {
  id: 1045,
  slug: "customers-who-bought-all-products",
  title: "Customers Who Bought All Products",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/customers-who-bought-all-products/",
  brief:
    "Customer records purchases as customer and product pairs, possibly with repeats. Product lists the full catalogue.",
  ask: "Return the customers who have bought every product in the catalogue.",
  concepts: ["GROUP BY", "HAVING", "AGGREGATE", "DISTINCT", "SUBQUERY"],
  tables: [
    {
      name: "Customer",
      columns: ["customer_id", "product_key"],
      rows: [
        [1, 5],
        [2, 6],
        [3, 5],
        [3, 6],
        [1, 6],
      ],
    },
    {
      name: "Product",
      pk: "product_key",
      columns: ["product_key"],
      rows: [[5], [6]],
    },
  ],
  expected: {
    name: "Result",
    columns: ["customer_id"],
    rows: [[1], [3]],
  },
  query: `SELECT customer_id
FROM Customer
GROUP BY customer_id
HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product);`,
  keyIdea:
    "Bought every product means counted as many distinct products as the catalogue holds. Comparing two counts avoids any set-difference gymnastics.",
  walkthrough: [
    {
      label: "GROUP BY customer_id",
      text: "Customers 1 and 3 each bought two products; customer 2 bought one.",
    },
    {
      label: "COUNT(DISTINCT product_key)",
      text: "DISTINCT guards against a customer buying the same product twice and appearing to have covered the catalogue.",
    },
    {
      label: "= (SELECT COUNT(*) FROM Product)",
      text: "The catalogue holds two products, so a count of 2 means complete coverage. Hard-coding 2 would break as soon as the catalogue changed.",
    },
  ],
  gotcha:
    "Without DISTINCT, a customer who bought product 5 twice and never bought 6 would count 2 and be wrongly included.",
  visual: {
    kind: "groupBy",
    source: {
      name: "Distinct customer-product pairs",
      columns: ["customer_id", "product_key"],
      rows: [
        [1, 5],
        [1, 6],
        [2, 6],
        [3, 5],
        [3, 6],
      ],
    },
    by: "customer_id",
    agg: { fn: "COUNT", column: "product_key", as: "distinct_products" },
  },
};
