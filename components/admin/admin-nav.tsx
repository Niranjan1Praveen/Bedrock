"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/library", label: "Library" },
  { href: "/admin/notes", label: "Notes" },
  { href: "/admin/messages", label: "Messages" },
];

/**
 * Admin tabs, with the current section marked.
 *
 * Overview matches exactly; the others match by prefix, so a nested page like
 * /admin/library/algorithms/deadlocks/unit-3 still shows Library as the section
 * you are in. Without the exact flag on Overview, /admin would light up on
 * every admin page, since every one of them starts with it.
 */
export function AdminNav() {
  const pathname = usePathname();

  const isActive = (tab: (typeof TABS)[number]) =>
    tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

  return (
    // No wrapping: this sits inside the bar's horizontal scroller, which
    // cannot do its job if the tabs stack instead of running off the edge.
    <nav className="flex items-center gap-x-5">
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`mono-label shrink-0 whitespace-nowrap transition-colors ${
              active ? "text-ink" : "text-ink-subtle hover:text-ink-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
