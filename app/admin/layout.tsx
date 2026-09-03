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
        <Container className="flex min-h-12 flex-wrap items-center justify-between gap-x-5 gap-y-2 py-2">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* The site header is not rendered in here, so this is the only
                way back out to the public site. */}
            <Link
              href="/"
              className="mono-label text-ink-subtle hover:text-ink transition-colors"
            >
              &larr; Home
            </Link>
            <span className="bg-line hidden h-4 w-px sm:block" aria-hidden />
            <AdminNav />
          </div>
          <SignOutButton />
        </Container>
      </div>
      {children}
    </>
  );
}
