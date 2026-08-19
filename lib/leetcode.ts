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
 * The upstream allows 120 requests per hour per IP and answers with 429 once
 * that is spent. Stats like these change a few times a day at most, so the
 * request is cached three ways to stay far inside that budget:
 *
 *  1. a persistent cache with a TTL, so reloads and revisits cost nothing;
 *  2. an in-flight promise, so React Strict Mode's double-invoked effect and
 *     any concurrent mounts share a single request;
 *  3. the last good payload is kept past its TTL, so if the API is rate
 *     limited, asleep or down, the page shows slightly old numbers instead of
 *     an error.
 */

export const LEETCODE_USERNAME = "Niranjan1Praveen";

const API = "https://alfa-leetcode-api.onrender.com";
const CACHE_KEY = "bedrock:leetcode:v1";
const TTL_MS = 30 * 60 * 1000;

export interface DifficultyStat {
  level: "Easy" | "Medium" | "Hard";
  solved: number;
  total: number;
}

export interface RecentSolve {
  title: string;
  slug: string;
  lang: string;
  at: number;
}

export interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  ranking: number;
  byDifficulty: DifficultyStat[];
  recent: RecentSolve[];
}

export interface LoadResult {
  stats: LeetCodeStats;
  /** When these numbers were actually retrieved. */
  fetchedAt: number;
  /** True when served from cache past its TTL because the API was unreachable. */
  stale: boolean;
}

/** Thrown on HTTP 429 so the UI can say how long to wait rather than guess. */
export class RateLimitError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super("Rate limited by the stats API.");
    this.name = "RateLimitError";
  }
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

interface CacheEntry {
  fetchedAt: number;
  stats: LeetCodeStats;
}

function readCache(): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    return typeof entry?.fetchedAt === "number" && entry.stats ? entry : null;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Caching is best-effort; a full quota should not break the page.
  }
}

/** Shared across concurrent callers so one render never issues two requests. */
let inFlight: Promise<LeetCodeStats> | null = null;

async function fetchFresh(username: string): Promise<LeetCodeStats> {
  const res = await fetch(`${API}/userProfile/${encodeURIComponent(username)}`);

  if (res.status === 429) {
    const header = Number(res.headers.get("retry-after"));
    throw new RateLimitError(
      Number.isFinite(header) && header > 0 ? header : 3600,
    );
  }
  if (!res.ok) throw new Error(`Stats API returned ${res.status}`);

  const raw = (await res.json()) as RawProfile & { errors?: unknown };
  if (raw.errors || typeof raw.totalSolved !== "number") {
    throw new Error(`No profile data for ${username}`);
  }
  return normalise(raw);
}

export async function loadLeetCodeStats({
  force = false,
  username = LEETCODE_USERNAME,
} = {}): Promise<LoadResult> {
  const cached = readCache();
  const fresh = cached && Date.now() - cached.fetchedAt < TTL_MS;

  if (cached && fresh && !force) {
    return { stats: cached.stats, fetchedAt: cached.fetchedAt, stale: false };
  }

  inFlight ??= fetchFresh(username).finally(() => {
    inFlight = null;
  });

  try {
    const stats = await inFlight;
    const fetchedAt = Date.now();
    writeCache({ fetchedAt, stats });
    return { stats, fetchedAt, stale: false };
  } catch (err) {
    // Old numbers beat no numbers. Only surface the failure if there is
    // genuinely nothing to show.
    if (cached) {
      return { stats: cached.stats, fetchedAt: cached.fetchedAt, stale: true };
    }
    throw err;
  }
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
