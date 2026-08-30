"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#selected-work", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/tracks/sql-50", label: "SQL 50" },
  { href: "/tracks", label: "All tracks" },
];

/**
 * Nav links behind a single toggle, at every width.
 *
 * A text "Menu" label rather than a hamburger glyph: the site carries no
 * decorative icons, and this matches the mono transport controls used on the
 * visualizations. The panel is anchored to the button rather than stretched
 * across the viewport, so one layout serves both phone and desktop.
 *
 * The signed-in state is fetched only when the menu is opened, not on page
 * load. That keeps every public page free of an extra request, and keeps
 * supabase-js out of the bundle on pages that will never need it.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const root = useRef<HTMLDivElement>(null);

  /**
   * Close on Escape, or on any interaction outside the menu.
   *
   * This was a full-screen overlay element, which silently did not work: the
   * header sets `backdrop-blur`, and a backdrop-filter makes its element a
   * containing block for fixed-position descendants. `fixed inset-0` therefore
   * resolved against the 56px header rather than the viewport, so the overlay
   * only ever covered the header strip and clicks on the page body missed it.
   *
   * A document-level listener has no such dependency on stacking or layout.
   * pointerdown rather than click so the menu closes as the press begins, and
   * capture so it still fires if something inside stops propagation.
   */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

  useEffect(() => {
    // Ask once per mount, and only after the menu has actually been opened.
    if (!open || signedIn !== null) return;
    const controller = new AbortController();
    fetch("/api/me", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { signedIn: false }))
      .then((d: { signedIn: boolean }) => setSignedIn(d.signedIn))
      .catch(() => setSignedIn(false));
    return () => controller.abort();
  }, [open, signedIn]);

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-haspopup="menu"
        className={`mono-label rounded border px-3 py-1.5 transition-colors ${
          open
            ? "border-ink-subtle text-ink"
            : "border-line text-ink-subtle hover:border-ink-subtle hover:text-ink"
        }`}
      >
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <>
          <nav
            id="site-menu"
            className="border-line bg-surface absolute top-full right-0 z-10 mt-3 w-48 rounded-xl border p-1.5"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="mono-label text-ink-subtle hover:bg-surface-2 hover:text-ink block rounded-lg px-3 py-2.5 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {signedIn && (
              <>
                <hr className="border-line my-1.5" />
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="mono-label text-accent hover:bg-surface-2 block rounded-lg px-3 py-2.5 transition-colors"
                >
                  Admin
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="mono-label text-ink-subtle hover:bg-surface-2 hover:text-ink block w-full rounded-lg px-3 py-2.5 text-left transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
