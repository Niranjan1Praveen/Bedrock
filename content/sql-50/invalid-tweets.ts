import type { Problem } from "../types";

export const problem: Problem = {
  id: 1683,
  slug: "invalid-tweets",
  title: "Invalid Tweets",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/invalid-tweets/",
  brief:
    "Tweets holds the text of each tweet. A tweet is invalid when its content is longer than 15 characters.",
  ask: "Return the ids of the invalid tweets.",
  concepts: ["SELECT", "WHERE", "STRING"],
  tables: [
    {
      name: "Tweets",
      pk: "tweet_id",
      columns: ["tweet_id", "content"],
      rows: [
        [1, "Let us Code"],
        [2, "More than fifteen chars are here!"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["tweet_id"],
    rows: [[2]],
  },
  query: `SELECT tweet_id
FROM Tweets
WHERE CHAR_LENGTH(content) > 15;`,
  keyIdea:
    "CHAR_LENGTH counts characters. LENGTH counts bytes, and the two differ the moment any character is non-ASCII.",
  walkthrough: [
    {
      label: "CHAR_LENGTH(content)",
      text: "Measure each tweet: 11 characters for the first, 33 for the second.",
    },
    {
      label: "> 15",
      text: "Strictly greater than 15, so a tweet of exactly 15 characters is still valid.",
    },
  ],
  gotcha:
    "LENGTH() looks equivalent and passes on this sample, but it counts bytes: a single emoji is four bytes and one character, so the two functions disagree on real tweets.",
  visual: {
    kind: "filter",
    table: "Tweets",
    predicate: "CHAR_LENGTH(content) > 15",
    keep: [1],
  },
};
