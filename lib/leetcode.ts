/**
 * LeetCode profile stats, via alfa-leetcode-api.
 *
 * Fetched from the browser rather than at build time, deliberately:
 *
 *  - every route in this app prerenders static, and a build-time fetch would
 *    tie a deploy to a third-party service being awake;
 *  - the API is hosted on a free tier that sleeps, so a cold start could stall
 *    or fail a Vercel build;
 *  - baked-in numbers would be stale until the next deploy, which defeats the
 *    point of showing live stats.
 *
 * The endpoint sends `access-control-allow-origin: *`, so no proxy route is
 * needed. If it is asleep or down, the section degrades to a retry prompt and
 * the rest of the page is unaffected.
 */

export const LEETCODE_USERNAME = "Niranjan1Praveen";

const API = "https://alfa-leetcode-api.onrender.com";

export interface DifficultyStat {
  level: "Easy" | "Medium" | "Hard";
  solved: number;
  total: number;
}

export interface RecentSolve {
  title: string;
  slug: string;
  lang: string;
  at: number; // epoch milliseconds
}

export interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  ranking: number;
  byDifficulty: DifficultyStat[];
  recent: RecentSolve[];
}

interface RawProfile {
  totalSolved: number;
  totalQuestions: number;
  ranking: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  recentSubmissions?: {
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
  }[];
}

function normalise(raw: RawProfile): LeetCodeStats {
  // recentSubmissions includes failed attempts and repeats of the same
  // problem; keep only accepted ones, most recent entry per problem.
  const seen = new Set<string>();
  const recent: RecentSolve[] = [];
  for (const s of raw.recentSubmissions ?? []) {
    if (s.statusDisplay !== "Accepted" || seen.has(s.titleSlug)) continue;
    seen.add(s.titleSlug);
    recent.push({
      title: s.title,
      slug: s.titleSlug,
      lang: s.lang,
      at: Number(s.timestamp) * 1000,
    });
  }

  return {
    totalSolved: raw.totalSolved,
    totalQuestions: raw.totalQuestions,
    ranking: raw.ranking,
    byDifficulty: [
      { level: "Easy", solved: raw.easySolved, total: raw.totalEasy },
      { level: "Medium", solved: raw.mediumSolved, total: raw.totalMedium },
      { level: "Hard", solved: raw.hardSolved, total: raw.totalHard },
    ],
    recent: recent.slice(0, 5),
  };
}

export async function fetchLeetCodeStats(
  username = LEETCODE_USERNAME,
  signal?: AbortSignal,
): Promise<LeetCodeStats> {
  const res = await fetch(`${API}/userProfile/${encodeURIComponent(username)}`, {
    signal,
  });
  if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`);

  const raw = (await res.json()) as RawProfile & { errors?: unknown };
  // The upstream returns 200 with an `errors` array for unknown users.
  if (raw.errors || typeof raw.totalSolved !== "number") {
    throw new Error(`No profile data for ${username}`);
  }
  return normalise(raw);
}

export const profileUrl = (username = LEETCODE_USERNAME) =>
  `https://leetcode.com/u/${username}/`;

export function relativeTime(ms: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  return mo < 12 ? `${mo}mo ago` : `${Math.round(mo / 12)}y ago`;
}
