"use client";

import { useCallback, useEffect, useState } from "react";

const STEP_MS = 1400;

/**
 * Step index plus playback for a visualization.
 *
 * Nothing plays until the viewer presses Play. These are explanations, not
 * decorations: a page of animations firing on load is noise, and on a revision
 * page it actively competes with reading. Playback then runs through once and
 * holds on the final frame rather than looping.
 *
 * `playing` is *derived* rather than stored, so reaching the last frame stops
 * playback as a consequence of state instead of a write from inside an effect.
 * That keeps every setState in an event handler or a timer callback.
 *
 * Reduced motion is deliberately NOT handled here: a viewer who prefers
 * reduced motion still gets to press Play and step through: what they should
 * lose is the tweening, which MotionConfig in VizFrame takes care of.
 */
export function useVizSteps(count: number) {
  const [index, setIndex] = useState(0);
  const [playRequested, setPlayRequested] = useState(false);

  const atEnd = index >= count - 1;
  const playing = playRequested && !atEnd;

  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, count - 1)),
    [count],
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  const reset = useCallback(() => {
    setIndex(0);
    setPlayRequested(false);
  }, []);

  const toggle = useCallback(() => {
    if (playing) {
      setPlayRequested(false);
      return;
    }
    // Restarting from the final frame rewinds, so Play always plays something.
    if (atEnd) setIndex(0);
    setPlayRequested(true);
  }, [playing, atEnd]);

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(next, STEP_MS);
    return () => clearTimeout(id);
  }, [playing, index, next]);

  return { index, setIndex, next, prev, reset, toggle, playing, atEnd };
}
