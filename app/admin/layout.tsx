import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SignOutButton } from "@/components/admin/sign-out-button";
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
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/admin"
              className="mono-label text-ink hover:text-ink-muted transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/admin/posts"
              className="mono-label text-ink-subtle hover:text-ink transition-colors"
            >
              Posts
            </Link>
            <Link
              href="/admin/library"
              className="mono-label text-ink-subtle hover:text-ink transition-colors"
            >
              Library
            </Link>
          </nav>
          <SignOutButton />
        </Container>
      </div>
      {children}
    </>
  );
}
