import type { Problem } from "../types";

export const problem: Problem = {
  id: 1633,
  slug: "percentage-of-users-attended-a-contest",
  title: "Percentage of Users Attended a Contest",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/percentage-of-users-attended-a-contest/",
  brief:
    "Users holds every registered user. Register holds one row per user per contest they signed up for.",
  ask: "For each contest, report the percentage of all users who registered, to 2 decimal places, highest first.",
  concepts: ["GROUP BY", "AGGREGATE", "SUBQUERY", "ROUND", "ORDER BY"],
  tables: [
    {
      name: "Users",
      pk: "user_id",
      columns: ["user_id", "user_name"],
      rows: [
        [6, "Alice"],
        [2, "Bob"],
        [7, "Alex"],
      ],
    },
    {
      name: "Register",
      columns: ["contest_id", "user_id"],
      rows: [
        [215, 6],
        [209, 2],
        [208, 2],
        [210, 6],
        [208, 6],
        [209, 7],
        [209, 6],
        [215, 7],
        [208, 7],
        [210, 2],
        [207, 2],
        [210, 7],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["contest_id", "percentage"],
    rows: [
      [208, "100.00"],
      [209, "100.00"],
      [210, "100.00"],
      [215, "66.67"],
      [207, "33.33"],
    ],
  },
  query: `SELECT contest_id,
       ROUND(
         COUNT(DISTINCT user_id) * 100.0 /
         (SELECT COUNT(*) FROM Users),
       2) AS percentage
FROM Register
GROUP BY contest_id
ORDER BY percentage DESC, contest_id ASC;`,
  keyIdea:
    "A scalar subquery returns one value and can sit anywhere a value can. Here it supplies the denominator, which is the same for every group.",
  walkthrough: [
    {
      label: "GROUP BY contest_id",
      text: "Bucket the registrations by contest. Contests 208, 209 and 210 have three registrants each; 215 has two and 207 has one.",
    },
    {
      label: "(SELECT COUNT(*) FROM Users)",
      text: "The total user count, 3. It does not depend on the group, so it is evaluated once and reused.",
    },
    {
      label: "* 100.0",
      text: "Multiplying by 100.0 rather than 100 forces floating-point division. With integers, 1 / 3 would truncate to 0.",
    },
    {
      label: "ORDER BY percentage DESC, contest_id ASC",
      text: "The three contests tied at 100.00 are then broken by contest id ascending.",
    },
  ],
  gotcha:
    "The denominator must be the count of all users, not the number of distinct users in Register. A user who never registered for anything still counts.",
  visual: {
    kind: "groupBy",
    source: {
      name: "Register",
      columns: ["contest_id", "user_id"],
      rows: [
        [207, 2],
        [208, 2],
        [208, 6],
        [208, 7],
        [209, 2],
        [209, 6],
        [209, 7],
        [210, 2],
        [210, 6],
        [210, 7],
        [215, 6],
        [215, 7],
      ],
    },
    by: "contest_id",
    agg: { fn: "COUNT", column: "user_id", as: "registrants" },
  },
};
