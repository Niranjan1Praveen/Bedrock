import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { getUser } from "@/lib/auth";
import { getAllPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Drafts must never be served from a cache.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // The proxy already redirects, but it is an optimistic check only.
  if (!(await getUser())) redirect("/login?next=/admin");

  const posts = await getAllPosts();

  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <nav className="mono-label text-ink-subtle flex items-center gap-2">
            <Link href="/admin" className="hover:text-ink transition-colors">
              Overview
            </Link>
            <span aria-hidden>/</span>
            <span className="text-ink">Posts</span>
          </nav>
          <h1 className="mt-5 text-3xl">Posts</h1>
          <p className="text-ink-subtle mt-3 text-sm">
            Drafts are listed here only. They stay reachable at their own URL
            while you are signed in.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="mono-label bg-ink text-base hover:bg-ink-muted rounded px-4 py-2.5 transition-colors"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="border-line text-ink-subtle mt-12 rounded-lg border border-dashed px-6 py-16 text-center text-sm">
          Nothing written yet.
        </p>
      ) : (
        <ul className="border-line mt-12 border-t">
          {posts.map((p) => (
            <li key={p.id} className="border-line border-b">
              <Link
                href={`/admin/posts/${p.slug}/edit`}
                className="group hover:bg-surface flex flex-col gap-2 px-2 py-5 transition-colors sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="mono-label text-ink-subtle w-36 shrink-0">
                  {formatDate(p.publishedAt)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate">{p.title}</span>
                  <span className="mono-label text-ink-subtle mt-1.5 block truncate">
                    /{p.slug}
                  </span>
                </span>
                <Pill tone={p.status === "PUBLISHED" ? "accent" : "warn"}>
                  {p.status === "PUBLISHED" ? "Live" : "Draft"}
                </Pill>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
