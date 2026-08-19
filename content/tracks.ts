import type { Track } from "./types";

export const TRACKS: Track[] = [
  {
    id: "sql-50",
    title: "SQL 50",
    blurb:
      "LeetCode's SQL 50: joins, aggregation, window functions and the NULL semantics that quietly break queries.",
    status: "active",
    total: 50,
  },
  {
    id: "dsa-patterns",
    title: "DSA Patterns",
    blurb:
      "The recurring shapes behind algorithm problems: two pointers, sliding window, binary search on answer, graph traversals.",
    status: "planned",
    total: 0,
  },
  {
    id: "system-design",
    title: "System Design",
    blurb:
      "Building blocks and trade-offs: caching, sharding, consistency models, queues.",
    status: "planned",
    total: 0,
  },
];
