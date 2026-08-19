import type { Problem } from "../types";

export const problem: Problem = {
  id: 1174,
  slug: "immediate-food-delivery-ii",
  title: "Immediate Food Delivery II",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/immediate-food-delivery-ii/",
  brief:
    "Delivery holds every order with the date it was placed and the date the customer wanted it. If those match, the order was immediate; otherwise it was scheduled.",
  ask: "Of each customer's first ever order, what percentage were immediate? Round to 2 decimal places.",
  concepts: ["SUBQUERY", "GROUP BY", "AGGREGATE", "DATE", "ROUND"],
  tables: [
    {
      name: "Delivery",
      pk: "delivery_id",
      columns: [
        "delivery_id",
        "customer_id",
        "order_date",
        "customer_pref_delivery_date",
      ],
      rows: [
        [1, 1, "2019-08-01", "2019-08-02"],
        [2, 2, "2019-08-02", "2019-08-02"],
        [3, 1, "2019-08-11", "2019-08-12"],
        [4, 3, "2019-08-24", "2019-08-24"],
        [5, 3, "2019-08-21", "2019-08-22"],
        [6, 2, "2019-08-11", "2019-08-13"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["immediate_percentage"],
    rows: [["33.33"]],
  },
  query: `SELECT ROUND(
         AVG(order_date = customer_pref_delivery_date) * 100,
       2) AS immediate_percentage
FROM Delivery
WHERE (customer_id, order_date) IN (
    SELECT customer_id, MIN(order_date)
    FROM Delivery
    GROUP BY customer_id
);`,
  keyIdea:
    "Find each customer's first order with a grouped subquery, then match on the pair of columns at once. A row qualifies only if both parts line up.",
  walkthrough: [
    {
      label: "MIN(order_date) per customer",
      text: "Customer 1 first ordered on 08-01, customer 2 on 08-02, customer 3 on 08-21. Note that customer 3's first order is not their lowest delivery_id.",
    },
    {
      label: "(customer_id, order_date) IN (...)",
      text: "Comparing a tuple keeps the customer and their own earliest date bound together. Matching them separately would let one customer's date qualify another customer's row.",
    },
    {
      label: "order_date = customer_pref_delivery_date",
      text: "Of the three first orders, only customer 2's was immediate.",
    },
    {
      label: "AVG(...) * 100",
      text: "In MySQL a comparison yields 1 or 0, so averaging gives 0.3333, which becomes 33.33.",
    },
  ],
  gotcha:
    "Customer 3 ordered on 08-24 with a lower delivery_id than their 08-21 order. Taking the first row by id rather than by date gets this wrong.",
  visual: {
    kind: "filter",
    table: "Delivery",
    predicate: "(customer_id, order_date) is that customer's first order",
    keep: [0, 1, 4],
  },
};
