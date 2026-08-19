import type { Problem } from "../types";

export const problem: Problem = {
  id: 1141,
  slug: "user-activity-for-the-past-30-days-i",
  title: "User Activity for the Past 30 Days I",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/user-activity-for-the-past-30-days-i/",
  brief:
    "Activity logs every action a user takes in a session. One user can produce several rows on the same day.",
  ask: "For each day in the 30 days ending 2019-07-27, report the number of distinct active users. Skip days with none.",
  concepts: ["WHERE", "GROUP BY", "AGGREGATE", "DISTINCT", "DATE"],
  tables: [
    {
      name: "Activity",
      columns: ["user_id", "session_id", "activity_date", "activity_type"],
      rows: [
        [1, 1, "2019-07-20", "open_session"],
        [1, 1, "2019-07-20", "scroll_down"],
        [1, 1, "2019-07-20", "end_session"],
        [2, 4, "2019-07-20", "open_session"],
        [2, 4, "2019-07-21", "send_message"],
        [2, 4, "2019-07-21", "end_session"],
        [3, 2, "2019-07-21", "open_session"],
        [3, 2, "2019-07-21", "send_message"],
        [3, 2, "2019-07-21", "end_session"],
        [4, 3, "2019-06-25", "open_session"],
        [4, 3, "2019-06-25", "end_session"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["day", "active_users"],
    rows: [
      ["2019-07-20", 2],
      ["2019-07-21", 2],
    ],
  },
  query: `SELECT activity_date AS day,
       COUNT(DISTINCT user_id) AS active_users
FROM Activity
WHERE activity_date > DATE_SUB('2019-07-27', INTERVAL 30 DAY)
  AND activity_date <= '2019-07-27'
GROUP BY activity_date;`,
  keyIdea:
    "Counting activity rows counts clicks. Counting distinct users counts people. The question decides which one you want.",
  walkthrough: [
    {
      label: "the 30 day window",
      text: "Strictly after 2019-06-27 and up to 2019-07-27. User 4's June activity falls outside and is dropped.",
    },
    {
      label: "GROUP BY activity_date",
      text: "One bucket per day. The 20th holds four rows, the 21st holds five.",
    },
    {
      label: "COUNT(DISTINCT user_id)",
      text: "The 20th has four rows but only users 1 and 2, so the answer is 2. Without DISTINCT it would read 4.",
    },
  ],
  gotcha:
    "Days with no activity are absent from the table and therefore absent from the output. GROUP BY can only produce buckets for rows that exist.",
  visual: {
    kind: "groupBy",
    source: {
      name: "Distinct user-days inside the window",
      columns: ["activity_date", "user_id"],
      rows: [
        ["2019-07-20", 1],
        ["2019-07-20", 2],
        ["2019-07-21", 2],
        ["2019-07-21", 3],
      ],
    },
    by: "activity_date",
    agg: { fn: "COUNT", column: "user_id", as: "active_users" },
  },
};
