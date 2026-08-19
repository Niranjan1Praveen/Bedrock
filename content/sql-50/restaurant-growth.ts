import type { Problem } from "../types";

export const problem: Problem = {
  id: 1321,
  slug: "restaurant-growth",
  title: "Restaurant Growth",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/restaurant-growth/",
  brief:
    "Customer logs every visit with the amount paid. Several customers can visit on the same day, and the same customer can return later.",
  ask: "Compute the seven-day moving total and average of daily takings, starting from the seventh day.",
  concepts: ["CTE", "WINDOW", "GROUP BY", "AGGREGATE", "ROUND"],
  tables: [
    {
      name: "Customer",
      columns: ["customer_id", "name", "visited_on", "amount"],
      rows: [
        [1, "Jhon", "2019-01-01", 100],
        [2, "Daniel", "2019-01-02", 110],
        [3, "Jade", "2019-01-03", 120],
        [4, "Khaled", "2019-01-04", 130],
        [5, "Winston", "2019-01-05", 110],
        [6, "Elvis", "2019-01-06", 140],
        [7, "Anna", "2019-01-07", 150],
        [8, "Maria", "2019-01-08", 80],
        [9, "Jaze", "2019-01-09", 110],
        [1, "Jhon", "2019-01-10", 130],
        [3, "Jade", "2019-01-10", 150],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["visited_on", "amount", "average_amount"],
    rows: [
      ["2019-01-07", 860, "122.86"],
      ["2019-01-08", 840, "120.00"],
      ["2019-01-09", 840, "120.00"],
      ["2019-01-10", 1000, "142.86"],
    ],
  },
  query: `WITH daily AS (
    SELECT visited_on, SUM(amount) AS amount
    FROM Customer
    GROUP BY visited_on
),
windowed AS (
    SELECT visited_on,
           SUM(amount) OVER w AS amount,
           ROUND(AVG(amount) OVER w, 2) AS average_amount,
           ROW_NUMBER() OVER (ORDER BY visited_on) AS rn
    FROM daily
    WINDOW w AS (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
)
SELECT visited_on, amount, average_amount
FROM windowed
WHERE rn >= 7
ORDER BY visited_on;`,
  keyIdea:
    "Collapse to one row per day first, then slide a window over those days. Windowing the raw visits would count a seven-visit span rather than a seven-day one.",
  walkthrough: [
    {
      label: "the daily CTE",
      text: "The 10th has two visits, 130 and 150. They must become a single day worth 280 before any window is applied.",
    },
    {
      label: "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
      text: "A frame of exactly seven rows: today plus the six days before it. Because the CTE guarantees one row per day, seven rows means seven days.",
    },
    {
      label: "why rn >= 7",
      text: "The first six days have an incomplete window and would report a total over fewer than seven days. Numbering the rows lets them be discarded.",
    },
    {
      label: "the last window",
      text: "Days 4 through 10 total 1000, which averages to 142.86.",
    },
  ],
  gotcha:
    "This only works because the sample has no gaps in the dates. ROWS counts rows, not calendar days, so a missing day would silently stretch the window back further than a week.",
};
