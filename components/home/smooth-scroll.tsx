"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Smooth scrolling, for as long as this is mounted.
 *
 * Deliberately scoped rather than put in the root layout: it belongs to the
 * portfolio landing page, and the reading surfaces (blog posts, the library's
 * document viewers) are better left on the browser's own scrolling, which
 * find-in-page, scroll anchoring and the PDF viewer's page tracking all
 * depend on behaving normally.
 *
 * Lenis rewrites the scroll position every frame, so it is skipped outright
 * for anyone who has asked for reduced motion -- there is no gentler setting
 * that still counts as honouring that.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Lenis drives its own requestAnimationFrame loop and eases in-page
      // anchor jumps (the header and footer both link to #selected-work).
      autoRaf: true,
      anchors: true,
      duration: 1.1,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
