import type { Problem } from "../types";

export const problem: Problem = {
  id: 1148,
  slug: "article-views-i",
  title: "Article Views I",
  difficulty: "Easy",
  url: "https://leetcode.com/problems/article-views-i/",
  brief:
    "Views records one row each time somebody views an article, holding both the article's author and the viewer.",
  ask: "Return the ids of authors who have viewed at least one of their own articles, sorted ascending.",
  concepts: ["SELECT", "WHERE", "DISTINCT", "ORDER BY"],
  tables: [
    {
      name: "Views",
      columns: ["article_id", "author_id", "viewer_id", "view_date"],
      rows: [
        [1, 3, 5, "2019-08-01"],
        [1, 3, 6, "2019-08-02"],
        [2, 7, 7, "2019-08-01"],
        [2, 7, 6, "2019-08-02"],
        [4, 7, 1, "2019-07-22"],
        [3, 4, 4, "2019-07-21"],
        [3, 4, 4, "2019-07-21"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["id"],
    rows: [[4], [7]],
  },
  query: `SELECT DISTINCT author_id AS id
FROM Views
WHERE author_id = viewer_id
ORDER BY id;`,
  keyIdea:
    "A WHERE clause can compare two columns of the same row, not just a column against a constant.",
  walkthrough: [
    {
      label: "author_id = viewer_id",
      text: "Compare the two columns within each row. Three rows match: author 7 viewing article 2, and author 4 viewing article 3 twice.",
    },
    {
      label: "DISTINCT",
      text: "Author 4 appears twice because the table records duplicate views. DISTINCT collapses them to one row.",
    },
    {
      label: "ORDER BY id",
      text: "Sort ascending. The alias defined in SELECT is usable here, because ORDER BY is evaluated after SELECT.",
    },
  ],
  gotcha:
    "Forgetting DISTINCT returns author 4 twice. The duplicate rows in the sample data are there specifically to catch that.",
  visual: {
    kind: "filter",
    table: "Views",
    predicate: "author_id = viewer_id",
    keep: [2, 5, 6],
  },
};
