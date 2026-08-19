import type { Problem } from "../types";

export const problem: Problem = {
  id: 1251,
  slug: "average-selling-price",
  title: "Average Selling Price",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/average-selling-price/",
  brief:
    "Prices gives each product a price that is valid between two dates. UnitsSold records how many units went out on a given day, at whatever price applied then.",
  ask: "Report the average selling price of each product, rounded to 2 decimal places.",
  concepts: ["INNER JOIN", "DATE", "GROUP BY", "AGGREGATE", "ROUND"],
  tables: [
    {
      name: "Prices",
      columns: ["product_id", "start_date", "end_date", "price"],
      rows: [
        [1, "2019-02-17", "2019-02-28", 5],
        [1, "2019-03-01", "2019-03-22", 20],
        [2, "2019-02-01", "2019-02-20", 15],
        [2, "2019-02-21", "2019-03-31", 30],
      ],
    },
    {
      name: "UnitsSold",
      columns: ["product_id", "purchase_date", "units"],
      rows: [
        [1, "2019-02-25", 100],
        [1, "2019-03-01", 15],
        [2, "2019-02-10", 200],
        [2, "2019-03-22", 30],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["product_id", "average_price"],
    rows: [
      [1, "6.96"],
      [2, "16.96"],
    ],
  },
  query: `SELECT p.product_id,
       ROUND(SUM(u.units * p.price) / SUM(u.units), 2) AS average_price
FROM Prices AS p
JOIN UnitsSold AS u
  ON u.product_id = p.product_id
 AND u.purchase_date BETWEEN p.start_date AND p.end_date
GROUP BY p.product_id;`,
  keyIdea:
    "This is a weighted average, not AVG. Total revenue divided by total units is not the same as the mean of the prices.",
  walkthrough: [
    {
      label: "join on a date range",
      text: "The ON clause matches on product and then on the sale falling inside the price window. A join condition does not have to be an equality.",
    },
    {
      label: "SUM(units * price)",
      text: "Revenue per row, summed per product. Product 1 earns 100 at 5 plus 15 at 20, so 800 in total.",
    },
    {
      label: "/ SUM(units)",
      text: "Divide by 115 units, giving 6.956, which rounds to 6.96. Averaging the two prices instead would wrongly give 12.50.",
    },
  ],
  gotcha:
    "AVG(price) looks right and is wrong, because it ignores how many units sold at each price. Whenever quantities differ, the average has to be weighted.",
};
