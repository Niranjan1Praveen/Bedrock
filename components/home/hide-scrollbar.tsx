"use client";

import { useEffect } from "react";

/**
 * Hides the window scrollbar for as long as this is mounted.
 *
 * There's no per-route class hook in the root layout, and this only needs to
 * apply to the homepage, so it's scoped here instead of touching every page:
 * the class goes on `<html>` on mount and comes off on unmount, so leaving
 * the homepage always restores the normal scrollbar elsewhere.
 */
export function HideScrollbar() {
  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");
    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
    };
  }, []);

  return null;
}
