import type { Problem } from "../types";

export const problem: Problem = {
  id: 1757,
  slug: "recyclable-and-low-fat-products",
  title: "Recyclable and Low Fat Products",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/recyclable-and-low-fat-products/",
  brief:
    "A Products table flags each product as low fat and as recyclable, each with 'Y' or 'N'.",
  ask: "Return the ids of products that are both low fat and recyclable.",
  concepts: ["SELECT", "WHERE"],
  tables: [
    {
      name: "Products",
      pk: "product_id",
      columns: ["product_id", "low_fats", "recyclable"],
      rows: [
        [0, "Y", "N"],
        [1, "Y", "Y"],
        [2, "N", "Y"],
        [3, "Y", "Y"],
        [4, "N", "N"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["product_id"],
    rows: [[1], [3]],
  },
  query: `SELECT product_id
FROM Products
WHERE low_fats = 'Y'
  AND recyclable = 'Y';`,
  keyIdea:
    "WHERE tests one row at a time. Two conditions joined by AND must both hold for that single row to survive.",
  walkthrough: [
    {
      label: "FROM Products",
      text: "Start with all five rows. Nothing has been discarded yet.",
    },
    {
      label: "WHERE ... AND ...",
      text: "Evaluate both flags against each row independently. A row is kept only if both comparisons return true.",
    },
    {
      label: "SELECT product_id",
      text: "Project away the two flag columns, leaving just the id of each surviving row.",
    },
  ],
  gotcha:
    "The flags are the characters 'Y' and 'N', not booleans. Comparing against Y without quotes makes SQL look for a column named Y.",
  visual: {
    kind: "filter",
    table: "Products",
    predicate: "low_fats = 'Y' AND recyclable = 'Y'",
    keep: [1, 3],
  },
};
