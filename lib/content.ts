import type { ConceptTag, Problem, Track } from "@/content/types";
import { TRACKS } from "@/content/tracks";
import { problems as sql50 } from "@/content/sql-50";

/**
 * The only door between pages and content.
 *
 * Everything is async even though it currently resolves from a static import,
 * so swapping the body of these functions for a database query later is a
 * drop-in change that touches no page. Nothing outside this module may import
 * from `content/` directly.
 */

const BY_TRACK: Record<string, Problem[]> = {
  "sql-50": sql50,
};

export async function getTracks(): Promise<Track[]> {
  return TRACKS;
}

export async function getTrack(id: string): Promise<Track | undefined> {
  return TRACKS.find((t) => t.id === id);
}

export async function getProblems(trackId: string): Promise<Problem[]> {
  return BY_TRACK[trackId] ?? [];
}

export async function getProblem(
  trackId: string,
  slug: string,
): Promise<Problem | undefined> {
  return (BY_TRACK[trackId] ?? []).find((p) => p.slug === slug);
}

/** Every (track, slug) pair, for generateStaticParams. */
export async function getAllProblemParams(): Promise<
  { track: string; slug: string }[]
> {
  return Object.entries(BY_TRACK).flatMap(([track, list]) =>
    list.map((p) => ({ track, slug: p.slug })),
  );
}

/** Previous and next problem in track order, for footer navigation. */
export async function getNeighbours(
  trackId: string,
  slug: string,
): Promise<{ prev?: Problem; next?: Problem }> {
  const list = BY_TRACK[trackId] ?? [];
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { prev: list[i - 1], next: list[i + 1] };
}

/** Concept tags across a track with how many problems use each. */
export async function getConceptCounts(
  trackId: string,
): Promise<{ concept: ConceptTag; count: number }[]> {
  const counts = new Map<ConceptTag, number>();
  for (const p of BY_TRACK[trackId] ?? []) {
    for (const c of p.concepts) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([concept, count]) => ({ concept, count }))
    .sort((a, b) => b.count - a.count || a.concept.localeCompare(b.concept));
}

/** How many problems are actually written, across every track. */
export async function getCorpusStats(): Promise<{
  written: number;
  planned: number;
}> {
  const written = Object.values(BY_TRACK).reduce((n, l) => n + l.length, 0);
  const planned = TRACKS.reduce((n, t) => n + t.total, 0);
  return { written, planned };
}
