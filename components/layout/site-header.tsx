"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { profile } from "@/content/profile";
import { SiteNav } from "./site-nav";

/**
 * The destinations worth a permanent slot, centred in the bar.
 *
 * Hidden below `md`, where the Menu holds the same links -- see the NAV array
 * in site-nav.tsx, which carries them so nothing is unreachable on a phone.
 */
const CENTRE = [
  { href: "/#selected-work", label: "Projects" },
  { href: "/#capabilities", label: "About me" },
];

// `rounded` rather than `rounded-full`, to match the Menu button beside them.
const centreLinkClass =
  "rounded border border-line px-4 py-2 font-mono text-[0.8125rem] font-semibold tracking-[0.14em] uppercase text-ink-subtle transition-colors hover:border-ink-subtle hover:text-ink";

export function SiteHeader() {
  const pathname = usePathname();
  // The admin section carries its own bar (see app/admin/layout.tsx), and two
  // stacked navigations was one too many. That bar holds the link back out to
  // the site, so nothing is unreachable without this one.
  const inAdmin = pathname.startsWith("/admin");
  // Only the landing page hides its bar on scroll. Everywhere else -- the
  // blog, the tracks, the library -- the bar is how you get around, and
  // taking it away mid-page would mean scrolling back up to navigate.
  const hidesOnScroll = pathname === "/";
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    if (!hidesOnScroll) return;

    // Set directly rather than through a requestAnimationFrame throttle: this
    // is one boolean, and React drops the update when it has not changed, so
    // the work per scroll event is a comparison.
    const onScroll = () => setAtTop(window.scrollY <= 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidesOnScroll]);

  const hidden = hidesOnScroll && !atTop;

  // After the hooks, so the hook order is the same on every route.
  if (inAdmin) return null;

  return (
    // No bottom rule: the bar sits directly on the hero, and a line across the
    // full width cut the page in two before the content had begun.
    <header
      // aria-hidden while off-screen so the links are not read out or tabbed
      // into while invisible.
      aria-hidden={hidden}
      className={`bg-base/80 sticky top-0 z-50 backdrop-blur-md transition-[transform,opacity] duration-300${
        hidden
          ? "pointer-events-none -translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* Gutter matches the page's sections -- see app/page.tsx. */}
      <div className="relative flex h-16 items-center justify-between gap-6 px-6 sm:h-20 sm:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <Logo className="text-ink group-hover:text-ink-muted size-5 transition-colors sm:size-6" />
          {/* The mark carries the identity on a narrow screen; the wordmark
              only competes with the Menu button for the little width there
              is. */}
          <span className="text-ink group-hover:text-ink-muted hidden font-mono text-sm font-semibold tracking-[0.14em] uppercase transition-colors sm:inline sm:text-[1rem]">
            Bedrock
          </span>
        </Link>

        {/* Absolutely centred, so the two flanking blocks can be any width
            without pulling the links off centre. */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 md:flex">
          {CENTRE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={centreLinkClass}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${profile.links.email}`}
            className={centreLinkClass}
          >
            Contact me
          </a>
        </nav>

        <SiteNav />
      </div>
    </header>
  );
}
