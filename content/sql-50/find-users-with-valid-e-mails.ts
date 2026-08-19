import type { Problem } from "../types";

export const problem: Problem = {
  id: 1517,
  slug: "find-users-with-valid-e-mails",
  title: "Find Users With Valid E-Mails",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/find-users-with-valid-e-mails/",
  brief:
    "Users holds email addresses of varying quality. A valid one has a prefix starting with a letter, containing only letters, digits, underscore, dot or dash, followed by the domain leetcode.com.",
  ask: "Return the users whose email address is valid.",
  concepts: ["WHERE", "REGEX", "STRING"],
  tables: [
    {
      name: "Users",
      pk: "user_id",
      columns: ["user_id", "name", "mail"],
      rows: [
        [1, "Winston", "winston@leetcode.com"],
        [2, "Jonathan", "jonathanisgreat"],
        [3, "Annabelle", "bella-@leetcode.com"],
        [4, "Sally", "sally.come@leetcode.com"],
        [5, "Marwan", "quarz#2020@leetcode.com"],
        [6, "David", "david69@gmail.com"],
        [7, "Shapiro", ".shapo@leetcode.com"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["user_id", "name", "mail"],
    rows: [
      [1, "Winston", "winston@leetcode.com"],
      [3, "Annabelle", "bella-@leetcode.com"],
      [4, "Sally", "sally.come@leetcode.com"],
    ],
  },
  query: `SELECT user_id, name, mail
FROM Users
WHERE mail REGEXP '^[A-Za-z][A-Za-z0-9_.-]*@leetcode[.]com$';`,
  keyIdea:
    "Anchoring with ^ and $ is what makes this a validation rather than a search. Without them the pattern would match anywhere inside a longer string.",
  walkthrough: [
    {
      label: "^[A-Za-z]",
      text: "The first character must be a letter. This is what rejects Shapiro, whose address opens with a dot.",
    },
    {
      label: "[A-Za-z0-9_.-]*",
      text: "The rest of the prefix. Marwan's hash is not in the set, so his address fails. Inside a character class the dot is literal and the dash is safe at the end.",
    },
    {
      label: "@leetcode[.]com$",
      text: "The domain, with the dot escaped by bracketing so it cannot match any character. David is on gmail and Jonathan has no domain at all.",
    },
  ],
  gotcha:
    "Writing the domain as @leetcode.com leaves the dot as a wildcard, so leetcodeXcom would pass. Bracketing or backslash-escaping it is what makes the test exact.",
  visual: {
    kind: "filter",
    table: "Users",
    predicate: "mail matches the valid address pattern",
    keep: [0, 2, 3],
  },
};
