"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "bedrock:progress:v1";

export interface ProgressEntry {
  revised: boolean;
  starred: boolean;
  revealed: boolean;
  lastVisited: number;
}

/** track id -> problem slug -> entry. Already shaped like a database row. */
export type ProgressState = Record<string, Record<string, ProgressEntry>>;

export const EMPTY_ENTRY: ProgressEntry = {
  revised: false,
  starred: false,
  revealed: false,
  lastVisited: 0,
};

const EMPTY: ProgressState = {};

/**
 * A tiny external store rather than per-component useState, so the header
 * counter and a problem's own toggle stay in sync without prop drilling.
 *
 * localStorage is read lazily inside the store and never at module scope or
 * during render -- prerendering runs this file in Node, where touching
 * `window` would fail the production build outright.
 */
let state: ProgressState | null = null;
const listeners = new Set<() => void>();

function load(): ProgressState {
  if (state !== null) return state;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as ProgressState) : {};
  } catch {
    // Private mode, quota, or hand-edited garbage -- fall back to empty.
    state = {};
  }
  return state;
}

function commit(next: ProgressState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Persisting is best-effort; the in-memory state still updates.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs of the same site in step.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    state = null;
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => load();
const getServerSnapshot = () => EMPTY;

export function useProgress() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const get = useCallback(
    (track: string, slug: string): ProgressEntry =>
      snapshot[track]?.[slug] ?? EMPTY_ENTRY,
    [snapshot],
  );

  const update = useCallback(
    (track: string, slug: string, patch: Partial<ProgressEntry>) => {
      const current = load();
      commit({
        ...current,
        [track]: {
          ...current[track],
          [slug]: {
            ...EMPTY_ENTRY,
            ...current[track]?.[slug],
            ...patch,
            lastVisited: Date.now(),
          },
        },
      });
    },
    [],
  );

  const stats = useCallback(
    (track: string) => {
      const entries = Object.values(snapshot[track] ?? {});
      return {
        revised: entries.filter((e) => e.revised).length,
        starred: entries.filter((e) => e.starred).length,
      };
    },
    [snapshot],
  );

  return { get, update, stats };
}
