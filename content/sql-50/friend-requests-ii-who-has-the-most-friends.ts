import type { Problem } from "../types";

export const problem: Problem = {
  id: 602,
  slug: "friend-requests-ii-who-has-the-most-friends",
  title: "Friend Requests II: Who Has the Most Friends",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/friend-requests-ii-who-has-the-most-friends/",
  brief:
    "RequestAccepted holds one row per accepted friendship, naming who asked and who accepted. Friendship is mutual, so both people gain a friend from each row.",
  ask: "Find the person with the most friends, and how many they have.",
  concepts: ["UNION", "GROUP BY", "AGGREGATE", "ORDER BY", "LIMIT"],
  tables: [
    {
      name: "RequestAccepted",
      columns: ["requester_id", "accepter_id", "accept_date"],
      rows: [
        [1, 2, "2016-06-03"],
        [1, 3, "2016-06-08"],
        [2, 3, "2016-06-08"],
        [3, 4, "2016-06-09"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["id", "num"],
    rows: [[3, 3]],
  },
  query: `SELECT id, COUNT(*) AS num
FROM (
    SELECT requester_id AS id FROM RequestAccepted
    UNION ALL
    SELECT accepter_id  AS id FROM RequestAccepted
) AS everyone
GROUP BY id
ORDER BY num DESC
LIMIT 1;`,
  keyIdea:
    "A mutual relationship stored across two columns has to be unpivoted into one before it can be counted. UNION ALL stacks the columns into a single list of participants.",
  walkthrough: [
    {
      label: "stack the two columns",
      text: "Every row contributes its requester and its accepter, turning four friendships into eight participations.",
    },
    {
      label: "UNION ALL, not UNION",
      text: "Plain UNION would deduplicate and destroy the counts. Every appearance is a separate friendship and has to survive.",
    },
    {
      label: "GROUP BY id",
      text: "Person 3 appears three times, twice as accepter and once as requester. Persons 1 and 2 appear twice each.",
    },
    {
      label: "ORDER BY num DESC LIMIT 1",
      text: "The problem guarantees no tie for the top spot, so taking a single row is safe here.",
    },
  ],
  gotcha:
    "Counting only requester_id, or only accepter_id, halves the answer. Each row means a friendship for both people named in it.",
  visual: {
    kind: "groupBy",
    source: {
      name: "Both columns stacked into one list",
      columns: ["id", "role"],
      rows: [
        [1, "requester"],
        [1, "requester"],
        [2, "requester"],
        [3, "requester"],
        [2, "accepter"],
        [3, "accepter"],
        [3, "accepter"],
        [4, "accepter"],
      ],
    },
    by: "id",
    agg: { fn: "COUNT", column: "role", as: "num" },
  },
};
