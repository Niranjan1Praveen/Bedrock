import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/library/progress-bar";
import { getUser } from "@/lib/auth";
import { getAllPosts, formatDate } from "@/lib/posts";
import {
  formatBytes,
  getLibraryStats,
  getRecentDocuments,
  getSubjectsWithProgress,
} from "@/lib/library";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ACTIONS = [
  { href: "/admin/posts/new", label: "Write a post" },
  { href: "/admin/library/upload", label: "Upload documents" },
  { href: "/admin/library", label: "Open library" },
  { href: "/admin/posts", label: "All posts" },
];

export default async function AdminPage() {
  const user = await getUser();
  const userId = typeof user?.sub === "string" ? user.sub : "";

  const [posts, stats, subjects, recentDocs] = await Promise.all([
    getAllPosts(),
    getLibraryStats(userId),
    getSubjectsWithProgress(userId),
    getRecentDocuments(4),
  ]);

  const published = posts.filter((p) => p.status === "PUBLISHED").length;
  const drafts = posts.length - published;
  const withProgress = subjects.filter((s) => s.documentCount > 0);

  const figures = [
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
    { label: "Subjects", value: stats.subjects },
    { label: "Topics", value: stats.topics },
    { label: "Documents", value: stats.documents },
    { label: "Stored", value: formatBytes(stats.totalBytes) },
  ];

  return (
    <Container className="py-16 sm:py-20">
      <MonoLabel>Overview</MonoLabel>
      <h1 className="mt-4 text-3xl">
        {stats.revised} of {stats.documents} documents revised
      </h1>
      <p className="text-ink-subtle mt-3 max-w-xl text-sm leading-relaxed">
        Progress below is yours alone. The other accounts keep their own and
        cannot see this.
      </p>

      {/* Quick actions */}
      <div className="mt-9 flex flex-wrap gap-3">
        {ACTIONS.map((a, i) => (
          <Link
            key={a.href}
            href={a.href}
            className={
              i === 0
                ? "mono-label bg-ink text-base hover:bg-ink-muted rounded px-4 py-2.5 transition-colors"
                : "mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded border px-4 py-2.5 transition-colors"
            }
          >
            {a.label}
          </Link>
        ))}
      </div>

      {/* Counts at a glance */}
      <section className="border-line mt-14 border-t pt-8">
        <MonoLabel>At a glance</MonoLabel>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
          {figures.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="mono-label text-ink-subtle">{f.label}</dt>
              <dd className="text-ink mt-2 text-2xl tabular-nums">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Library progress */}
      <section className="border-line mt-12 border-t pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <MonoLabel>Library progress</MonoLabel>
          <Link
            href="/admin/library"
            className="mono-label text-ink-subtle hover:text-ink transition-colors"
          >
            Open &rarr;
          </Link>
        </div>

        {withProgress.length === 0 ? (
          <p className="text-ink-subtle mt-6 text-sm">Nothing uploaded yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {withProgress.map((s) => (
              <Link
                key={s.id}
                href={`/admin/library/${s.slug}`}
                className="group min-w-0"
              >
                <p className="text-ink-muted group-hover:text-ink truncate text-sm transition-colors">
                  {s.name}
                </p>
                <ProgressBar
                  done={s.revisedCount}
                  total={s.documentCount}
                  className="mt-2"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="border-line mt-12 border-t pt-8">
        <MonoLabel>Recent</MonoLabel>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="mono-label text-ink-subtle">Uploads</p>
            {recentDocs.length === 0 ? (
              <p className="text-ink-subtle mt-4 text-sm">Nothing yet.</p>
            ) : (
              <ul className="border-line mt-4 border-t">
                {recentDocs.map((d) => (
                  <li key={d.id} className="border-line border-b">
                    <Link
                      href={`/admin/library/${d.topic.subject.slug}/${d.topic.slug}/${d.slug}`}
                      className="group hover:bg-surface flex items-center gap-4 px-2 py-3 transition-colors"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="text-ink-muted group-hover:text-ink block truncate text-sm transition-colors">
                          {d.title}
                        </span>
                        <span className="mono-label text-ink-subtle mt-1 block truncate">
                          {d.topic.subject.name} · {d.topic.name}
                        </span>
                      </span>
                      <span className="mono-label text-ink-subtle shrink-0">
                        {formatBytes(d.sizeBytes)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <p className="mono-label text-ink-subtle">Posts</p>
              <Link
                href="/admin/posts"
                className="mono-label text-ink-subtle hover:text-ink transition-colors"
              >
                All &rarr;
              </Link>
            </div>
            {posts.length === 0 ? (
              <p className="text-ink-subtle mt-4 text-sm">Nothing written yet.</p>
            ) : (
              <ul className="border-line mt-4 border-t">
                {posts.slice(0, 4).map((p) => (
                  <li key={p.id} className="border-line border-b">
                    <Link
                      href={`/admin/posts/${p.slug}/edit`}
                      className="group hover:bg-surface flex items-center gap-4 px-2 py-3 transition-colors"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="text-ink-muted group-hover:text-ink block truncate text-sm transition-colors">
                          {p.title}
                        </span>
                        <span className="mono-label text-ink-subtle mt-1 block">
                          {formatDate(p.publishedAt)}
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
          </div>
        </div>
      </section>
    </Container>
  );
}
