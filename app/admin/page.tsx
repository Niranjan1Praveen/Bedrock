import { Suspense, cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { Pill } from "@/components/ui/pill";
import {
  Skeleton,
  SkeletonFigures,
  SkeletonRows,
} from "@/components/ui/skeleton";
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

/**
 * The page shell renders without awaiting anything, and each block below
 * streams in on its own.
 *
 * Previously every query was awaited before a single byte of HTML went out, so
 * a click sat on the old page until the slowest of four queries finished. Now
 * the heading, the actions and the section rules paint immediately and each
 * section fills in as its data lands.
 *
 * Two blocks need the same figures, so the fetches are wrapped in React's
 * cache: they dedupe within a request rather than querying twice.
 */
const stats = cache((userId: string) => getLibraryStats(userId));
const subjects = cache((userId: string) => getSubjectsWithProgress(userId));
const posts = cache(() => getAllPosts());

async function userId() {
  const user = await getUser();
  return typeof user?.sub === "string" ? user.sub : "";
}

async function Headline() {
  const s = await stats(await userId());
  return (
    <h1 className="mt-4 text-3xl">
      {s.revised} of {s.documents} documents revised
    </h1>
  );
}

async function Figures() {
  const [s, p] = await Promise.all([stats(await userId()), posts()]);
  const published = p.filter((x) => x.status === "PUBLISHED").length;

  const figures = [
    { label: "Published", value: published },
    { label: "Drafts", value: p.length - published },
    { label: "Subjects", value: s.subjects },
    { label: "Topics", value: s.topics },
    { label: "Documents", value: s.documents },
    { label: "Stored", value: formatBytes(s.totalBytes) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
      {figures.map((f) => (
        <div key={f.label} className="min-w-0">
          <dt className="mono-label text-ink-subtle">{f.label}</dt>
          <dd className="text-ink mt-2 text-2xl tabular-nums">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

async function LibraryProgress() {
  const all = await subjects(await userId());
  const withDocs = all.filter((s) => s.documentCount > 0);

  if (withDocs.length === 0) {
    return <p className="text-ink-subtle text-sm">Nothing uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {withDocs.map((s) => (
        <Link key={s.id} href={`/admin/library/${s.slug}`} className="group min-w-0">
          <p className="text-ink-muted group-hover:text-ink truncate text-sm transition-colors">
            {s.name}
          </p>
          <ProgressBar done={s.revisedCount} total={s.documentCount} className="mt-2" />
        </Link>
      ))}
    </div>
  );
}

async function RecentUploads() {
  const docs = await getRecentDocuments(4);
  if (docs.length === 0) {
    return <p className="text-ink-subtle mt-4 text-sm">Nothing yet.</p>;
  }

  return (
    <ul className="border-line mt-4 border-t">
      {docs.map((d) => (
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
  );
}

async function RecentPosts() {
  const all = await posts();
  if (all.length === 0) {
    return <p className="text-ink-subtle mt-4 text-sm">Nothing written yet.</p>;
  }

  return (
    <ul className="border-line mt-4 border-t">
      {all.slice(0, 4).map((p) => (
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
  );
}

export default function AdminPage() {
  return (
    <Container className="py-16 sm:py-20">
      <MonoLabel>Overview</MonoLabel>

      <Suspense fallback={<Skeleton className="mt-4 h-9 w-80" />}>
        <Headline />
      </Suspense>

      <p className="text-ink-subtle mt-3 max-w-xl text-sm leading-relaxed">
        Progress below is yours alone. The other accounts keep their own and
        cannot see this.
      </p>

      {/* Static, so it is interactive before any query returns. */}
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

      <section className="border-line mt-14 border-t pt-8">
        <MonoLabel>At a glance</MonoLabel>
        <div className="mt-6">
          <Suspense fallback={<SkeletonFigures />}>
            <Figures />
          </Suspense>
        </div>
      </section>

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
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-3 h-3 w-full" />
                  </div>
                ))}
              </div>
            }
          >
            <LibraryProgress />
          </Suspense>
        </div>
      </section>

      <section className="border-line mt-12 border-t pt-8">
        <MonoLabel>Recent</MonoLabel>
        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="mono-label text-ink-subtle">Uploads</p>
            <Suspense fallback={<div className="mt-4"><SkeletonRows rows={4} /></div>}>
              <RecentUploads />
            </Suspense>
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
            <Suspense fallback={<div className="mt-4"><SkeletonRows rows={4} /></div>}>
              <RecentPosts />
            </Suspense>
          </div>
        </div>
      </section>
    </Container>
  );
}
