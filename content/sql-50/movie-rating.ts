import type { Problem } from "../types";

export const problem: Problem = {
  id: 1341,
  slug: "movie-rating",
  title: "Movie Rating",
  difficulty: "Medium",
  url: "https://leetcode.com/problems/movie-rating/",
  brief:
    "MovieRating links users to movies with a rating and a date. Two unrelated questions are asked of it, and both answers go in the same one-column result.",
  ask: "Report the user who rated the most movies, then the movie with the highest average rating in February 2020. Break ties by the lexicographically smaller name.",
  concepts: ["INNER JOIN", "GROUP BY", "AGGREGATE", "UNION", "ORDER BY", "LIMIT"],
  tables: [
    {
      name: "Movies",
      pk: "movie_id",
      columns: ["movie_id", "title"],
      rows: [
        [1, "Avengers"],
        [2, "Frozen 2"],
        [3, "Joker"],
      ],
    },
    {
      name: "Users",
      pk: "user_id",
      columns: ["user_id", "name"],
      rows: [
        [1, "Daniel"],
        [2, "Monica"],
        [3, "Maria"],
        [4, "James"],
      ],
    },
    {
      name: "MovieRating",
      columns: ["movie_id", "user_id", "rating", "created_at"],
      rows: [
        [1, 1, 3, "2020-01-12"],
        [1, 2, 4, "2020-02-11"],
        [1, 3, 2, "2020-02-12"],
        [1, 4, 1, "2020-01-01"],
        [2, 1, 5, "2020-02-17"],
        [2, 2, 2, "2020-02-01"],
        [2, 3, 2, "2020-03-01"],
        [3, 1, 3, "2020-02-22"],
        [3, 2, 4, "2020-02-25"],
      ],
    },
  ],
  expected: {
    name: "Result",
    columns: ["results"],
    rows: [["Daniel"], ["Frozen 2"]],
  },
  query: `(SELECT u.name AS results
 FROM MovieRating AS mr
 JOIN Users AS u ON u.user_id = mr.user_id
 GROUP BY mr.user_id, u.name
 ORDER BY COUNT(*) DESC, u.name ASC
 LIMIT 1)

UNION ALL

(SELECT m.title AS results
 FROM MovieRating AS mr
 JOIN Movies AS m ON m.movie_id = mr.movie_id
 WHERE mr.created_at >= '2020-02-01'
   AND mr.created_at <  '2020-03-01'
 GROUP BY mr.movie_id, m.title
 ORDER BY AVG(mr.rating) DESC, m.title ASC
 LIMIT 1);`,
  keyIdea:
    "Each half is an ordinary group-and-rank query. UNION ALL only requires that both sides produce the same number of columns of compatible type, so unrelated answers can share one result.",
  walkthrough: [
    {
      label: "the busiest rater",
      text: "Daniel and Monica both rated three movies. The tiebreak on name ascending picks Daniel.",
    },
    {
      label: "the February window",
      text: "A half-open range, from the 1st of February up to but excluding the 1st of March. This avoids any question of what time of day a boundary date carries.",
    },
    {
      label: "the best rated movie",
      text: "In February, Frozen 2 averages 3.5 from ratings of 5 and 2, and Joker also averages 3.5 from 3 and 4. Frozen 2 wins on title order.",
    },
    {
      label: "parenthesised branches",
      text: "Each branch is wrapped in brackets so its own ORDER BY and LIMIT apply to that branch alone, rather than to the combined result.",
    },
  ],
  gotcha:
    "Without the brackets, the trailing ORDER BY and LIMIT attach to the whole union and one of the two answers disappears.",
};
