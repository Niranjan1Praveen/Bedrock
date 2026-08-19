import type { Problem } from "../types";

export const problem: Problem = {
  id: 1729,
  slug: "find-followers-count",
  title: "Find Followers Count",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/find-followers-count/",
  brief:
    "Followers holds one row per follow relationship, pairing a user with somebody who follows them.",
  ask: "Report the number of followers each user has, ordered by user id.",
  concepts: ["GROUP BY", "AGGREGATE", "ORDER BY"],
  tables: [
    {
      name: "Followers",
      columns: ["user_id", "follower_id"],
      rows: [
        [0, 1],
        [1, 0],
        [2, 0],
        [2, 1],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["user_id", "followers_count"],
    rows: [
      [0, 1],
      [1, 1],
      [2, 2],
    ],
  },
  query: `SELECT user_id, COUNT(follower_id) AS followers_count
FROM Followers
GROUP BY user_id
ORDER BY user_id;`,
  keyIdea:
    "In a link table, counting rows per key is counting relationships. Which column you group by decides which direction of the relationship you are measuring.",
  walkthrough: [
    {
      label: "GROUP BY user_id",
      text: "Bucket by the person being followed. User 2 appears twice, so their bucket holds two rows.",
    },
    {
      label: "COUNT(follower_id)",
      text: "One follower each for users 0 and 1, two for user 2.",
    },
    {
      label: "ORDER BY user_id",
      text: "Group order is not guaranteed, so ask for the sort explicitly.",
    },
  ],
  gotcha:
    "Grouping by follower_id instead answers a different question entirely: how many people each user follows.",
  visual: {
    kind: "groupBy",
    source: {
      name: "Followers",
      columns: ["user_id", "follower_id"],
      rows: [
        [0, 1],
        [1, 0],
        [2, 0],
        [2, 1],
      ],
    },
    by: "user_id",
    agg: { fn: "COUNT", column: "follower_id", as: "followers_count" },
  },
};
