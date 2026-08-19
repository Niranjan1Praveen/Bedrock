import type { Problem } from "../types";

export const problem: Problem = {
  id: 1164,
  slug: "product-price-at-a-given-date",
  title: "Product Price at a Given Date",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/product-price-at-a-given-date/",
  brief:
    "Products records every price change as a row. A product's price on a date is whatever the most recent change on or before that date set it to. Products start at 10 before any change.",
  ask: "Report the price of every product on 2019-08-16.",
  concepts: ["SUBQUERY", "GROUP BY", "AGGREGATE", "UNION", "DATE"],
  tables: [
    {
      name: "Products",
      columns: ["product_id", "new_price", "change_date"],
      rows: [
        [1, 20, "2019-08-14"],
        [2, 50, "2019-08-14"],
        [1, 30, "2019-08-15"],
        [1, 35, "2019-08-16"],
        [2, 65, "2019-08-17"],
        [3, 20, "2019-08-18"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["product_id", "price"],
    rows: [
      [2, 50],
      [1, 35],
      [3, 10],
    ],
  },
  query: `SELECT product_id, new_price AS price
FROM Products
WHERE (product_id, change_date) IN (
    SELECT product_id, MAX(change_date)
    FROM Products
    WHERE change_date <= '2019-08-16'
    GROUP BY product_id
)

UNION ALL

SELECT product_id, 10 AS price
FROM Products
GROUP BY product_id
HAVING MIN(change_date) > '2019-08-16';`,
  keyIdea:
    "Point-in-time lookups take the latest change on or before the date. Anything whose first change is still in the future has to be supplied separately, because it has no row to select.",
  walkthrough: [
    {
      label: "filter to changes up to the date",
      text: "Product 2's jump to 65 on the 17th is in the future and is excluded, leaving its price at 50.",
    },
    {
      label: "MAX(change_date) per product",
      text: "Product 1 changed on the 14th, 15th and 16th. The latest is the 16th, so its price is 35.",
    },
    {
      label: "(product_id, change_date) IN (...)",
      text: "Match on the pair to pull back the whole row, since the price itself cannot come out of the aggregate.",
    },
    {
      label: "the second query",
      text: "Product 3 only changes on the 18th, so it has no qualifying row at all. Its default price of 10 has to be produced explicitly.",
    },
  ],
  gotcha:
    "The default of 10 is invisible in the data. Any solution built purely from the rows present will silently omit product 3.",
  visual: {
    kind: "filter",
    table: "Products",
    predicate: "the latest change on or before 2019-08-16, per product",
    keep: [1, 3],
  },
};
