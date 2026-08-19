import type { Problem } from "../types";

export const problem: Problem = {
  id: 550,
  slug: "game-play-analysis-iv",
  title: "Game Play Analysis IV",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/game-play-analysis-iv/",
  brief:
    "Activity logs one row per player per day they logged in. Retention asks whether a player came back the very next day after their first ever login.",
  ask: "Report the fraction of players who logged in again on the day immediately after their first login, rounded to 2 decimal places.",
  concepts: ["SUBQUERY", "GROUP BY", "AGGREGATE", "DATE", "ROUND"],
  tables: [
    {
      name: "Activity",
      columns: ["player_id", "device_id", "event_date", "games_played"],
      rows: [
        [1, 2, "2016-03-01", 5],
        [1, 2, "2016-03-02", 6],
        [2, 3, "2017-06-25", 1],
        [3, 1, "2016-03-02", 0],
        [3, 4, "2018-07-03", 5],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["fraction"],
    rows: [["0.33"]],
  },
  query: `SELECT ROUND(
         COUNT(DISTINCT player_id) /
         (SELECT COUNT(DISTINCT player_id) FROM Activity),
       2) AS fraction
FROM Activity
WHERE (player_id, DATE_SUB(event_date, INTERVAL 1 DAY)) IN (
    SELECT player_id, MIN(event_date)
    FROM Activity
    GROUP BY player_id
);`,
  keyIdea:
    "Rather than looking forward from the first login, shift each row back by a day and ask whether it lands on that player's first login. The comparison becomes an equality.",
  walkthrough: [
    {
      label: "MIN(event_date) per player",
      text: "Player 1 starts 2016-03-01, player 2 on 2017-06-25, player 3 on 2016-03-02.",
    },
    {
      label: "DATE_SUB(event_date, INTERVAL 1 DAY)",
      text: "Player 1's 03-02 row shifts back to 03-01, which is their first login, so it qualifies. Player 3's 2018 row shifts to 2018-07-02 and matches nothing.",
    },
    {
      label: "COUNT(DISTINCT player_id)",
      text: "One player qualified. DISTINCT matters because a player could log in twice on the same day.",
    },
    {
      label: "divided by the total players",
      text: "1 of 3 gives 0.3333, rounded to 0.33.",
    },
  ],
  gotcha:
    "The denominator is all players, not just those with more than one login. Players who never came back are exactly what the metric is measuring.",
  visual: {
    kind: "filter",
    table: "Activity",
    predicate: "event_date is the day after that player's first login",
    keep: [1],
  },
};
