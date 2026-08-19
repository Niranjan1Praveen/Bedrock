import type { Problem } from "../types";

export const problem: Problem = {
  id: 1934,
  slug: "confirmation-rate",
  title: "Confirmation Rate",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/confirmation-rate/",
  brief:
    "Signups holds every user. Confirmations holds each confirmation request they were sent, marked confirmed or timeout. A user may have no requests at all.",
  ask: "For each user, report the fraction of their requests that were confirmed, rounded to 2 decimal places.",
  concepts: ["LEFT JOIN", "GROUP BY", "AGGREGATE", "CASE", "ROUND"],
  tables: [
    {
      name: "Signups",
      pk: "user_id",
      columns: ["user_id", "time_stamp"],
      rows: [
        [3, "2020-03-21 10:16:13"],
        [7, "2020-01-04 13:57:59"],
        [2, "2020-07-29 23:09:44"],
        [6, "2020-12-09 10:39:37"],
      ],
    },
    {
      name: "Confirmations",
      columns: ["user_id", "time_stamp", "action"],
      rows: [
        [3, "2021-01-06 03:30:46", "timeout"],
        [3, "2021-07-14 14:00:00", "timeout"],
        [7, "2021-06-12 11:57:29", "confirmed"],
        [7, "2021-06-13 12:58:28", "confirmed"],
        [7, "2021-06-14 13:59:27", "confirmed"],
        [2, "2021-01-22 00:00:00", "confirmed"],
        [2, "2021-02-28 23:59:59", "timeout"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["user_id", "confirmation_rate"],
    rows: [
      [6, "0.00"],
      [3, "0.00"],
      [7, "1.00"],
      [2, "0.50"],
    ],
  },
  query: `SELECT s.user_id,
       ROUND(AVG(CASE WHEN c.action = 'confirmed' THEN 1 ELSE 0 END), 2)
         AS confirmation_rate
FROM Signups AS s
LEFT JOIN Confirmations AS c
  ON s.user_id = c.user_id
GROUP BY s.user_id;`,
  keyIdea:
    "AVG over a CASE that yields 1 or 0 is how you compute a rate: the average of a column of ones and zeroes is exactly the proportion of ones.",
  walkthrough: [
    {
      label: "LEFT JOIN",
      text: "Keep every signup. User 6 was never sent a request, so their row is NULL-filled, and still has to appear in the answer.",
    },
    {
      label: "CASE WHEN ... THEN 1 ELSE 0 END",
      text: "Turn each request into a number. For user 6 the comparison against NULL is not a match, so ELSE gives 0 rather than NULL.",
    },
    {
      label: "AVG(...)",
      text: "User 7 averages 1, 1, 1 to 1.00; user 2 averages 1, 0 to 0.50; users 3 and 6 average to 0.00.",
    },
    {
      label: "ROUND(..., 2)",
      text: "Two decimal places, as asked.",
    },
  ],
  gotcha:
    "Dropping the ELSE 0 gives NULL for user 6, because AVG skips NULLs entirely and their only row is NULL. The ELSE is what pins an unmatched user to zero.",
  visual: {
    kind: "groupBy",
    source: {
      name: "After the join, confirmed as 1 or 0",
      columns: ["user_id", "confirmed"],
      rows: [
        [6, 0],
        [3, 0],
        [3, 0],
        [7, 1],
        [7, 1],
        [7, 1],
        [2, 1],
        [2, 0],
      ],
    },
    by: "user_id",
    agg: { fn: "AVG", column: "confirmed", as: "confirmation_rate" },
    round: 2,
  },
};
