import type { Problem } from "../types";

export const problem: Problem = {
  id: 1327,
  slug: "list-the-products-ordered-in-a-period",
  title: "List the Products Ordered in a Period",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/list-the-products-ordered-in-a-period/",
  brief:
    "Products is the catalogue. Orders records each order with its date and the number of units, and a product can be ordered many times.",
  ask: "Report the products with at least 100 units ordered during February 2020, with their total.",
  concepts: ["INNER JOIN", "WHERE", "GROUP BY", "HAVING", "AGGREGATE", "DATE"],
  tables: [
    {
      name: "Products",
      pk: "product_id",
      columns: ["product_id", "product_name", "product_category"],
      rows: [
        [1, "Leetcode Solutions", "Book"],
        [2, "Jewels of Stringology", "Book"],
        [3, "HP", "Laptop"],
        [4, "Lenovo", "Laptop"],
        [5, "Leetcode Kit", "T-shirt"],
      ],
    },
    {
      name: "Orders",
      columns: ["product_id", "order_date", "unit"],
      rows: [
        [1, "2020-02-05", 60],
        [1, "2020-02-10", 70],
        [2, "2020-01-18", 30],
        [2, "2020-02-11", 80],
        [3, "2020-02-17", 2],
        [3, "2020-02-24", 3],
        [4, "2020-03-01", 20],
        [4, "2020-03-04", 30],
        [4, "2020-03-04", 60],
        [5, "2020-02-25", 50],
        [5, "2020-02-27", 50],
        [5, "2020-03-01", 50],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["product_name", "unit"],
    rows: [
      ["Leetcode Solutions", 130],
      ["Leetcode Kit", 100],
    ],
  },
  query: `SELECT p.product_name, SUM(o.unit) AS unit
FROM Products AS p
JOIN Orders AS o
  ON o.product_id = p.product_id
WHERE o.order_date >= '2020-02-01'
  AND o.order_date <  '2020-03-01'
GROUP BY p.product_id, p.product_name
HAVING SUM(o.unit) >= 100;`,
  keyIdea:
    "WHERE narrows the rows before grouping; HAVING judges the groups afterwards. Both appear here, and they are doing different jobs.",
  walkthrough: [
    {
      label: "WHERE on the date",
      text: "Only February orders survive. Jewels of Stringology loses its January order, and Lenovo loses everything.",
    },
    {
      label: "GROUP BY the product",
      text: "Leetcode Solutions collects 60 and 70; Leetcode Kit collects 50 and 50, since its March order was already filtered out.",
    },
    {
      label: "HAVING SUM(o.unit) >= 100",
      text: "Totals of 130 and 100 pass. Jewels of Stringology at 80 and HP at 5 do not. This has to be HAVING because it tests a total.",
    },
  ],
  gotcha:
    "Moving the date test into HAVING would let March orders into the totals before filtering, and Leetcode Kit would wrongly reach 150.",
  visual: {
    kind: "groupBy",
    source: {
      name: "February orders, after the join",
      columns: ["product_name", "unit"],
      rows: [
        ["Leetcode Solutions", 60],
        ["Leetcode Solutions", 70],
        ["Jewels of Stringology", 80],
        ["HP", 2],
        ["HP", 3],
        ["Leetcode Kit", 50],
        ["Leetcode Kit", 50],
      ],
    },
    by: "product_name",
    agg: { fn: "SUM", column: "unit", as: "unit" },
  },
};
