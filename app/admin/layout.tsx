import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { getUser } from "@/lib/auth";

/**
 * Shared chrome for every admin page, and the one place the session is checked
 * for the whole section.
 *
 * The proxy already redirects signed-out browsers, but it is an optimistic
 * check by Next's own definition, so the guard is repeated here where it
 * actually counts. Each page keeps its own check too: a layout is not a
 * security boundary in the App Router, since a page can render without its
 * layout re-running on client navigation.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await getUser())) redirect("/login?next=/admin");

  return (
    <>
      <div className="border-line bg-surface border-b">
        <Container className="flex min-h-12 items-center justify-between gap-x-5 py-2">
          {/* Scrolls sideways rather than wrapping. On a phone the six
              controls are wider than the screen, and a bar that grew to two
              or three rows pushed the page itself down that far on every
              admin route. The clipped last item is what says there is more.

              py-1 leaves room for a focus outline: setting overflow-x also
              computes overflow-y to auto, so a ring on the last link would
              otherwise be shaved off. */}
          <div className="hide-scrollbar flex min-w-0 flex-1 items-center gap-x-5 overflow-x-auto py-1">
            {/* The site header is not rendered in here, so this is the only
                way back out to the public site. */}
            <Link
              href="/"
              className="mono-label text-ink-subtle hover:text-ink shrink-0 whitespace-nowrap transition-colors"
            >
              &larr; Home
            </Link>
            <span className="bg-line h-4 w-px shrink-0" aria-hidden />
            <AdminNav />
          </div>
          {/* Outside the scroller, so it is reachable without scrolling. */}
          <SignOutButton className="shrink-0" />
        </Container>
      </div>
      {children}
    </>
  );
}
