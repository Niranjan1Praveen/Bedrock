"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
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
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
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
          {/* Click-away target. Sits under the panel, over the page. */}
          <div
            className="fixed inset-0 z-0"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
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
          </nav>
        </>
      )}
    </div>
  );
}
