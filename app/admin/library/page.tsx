import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { getSubjects } from "@/lib/library";

export const metadata: Metadata = {
  title: "Library",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const subjects = await getSubjects();

  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <MonoLabel>Library</MonoLabel>
          <h1 className="mt-4 text-3xl">Subjects</h1>
          <p className="text-ink-subtle mt-3 max-w-xl text-sm leading-relaxed">
            Reference PDFs, read in the browser. Files are private and are
            served on links that expire.
          </p>
        </div>
        <Link
          href="/admin/library/upload"
          className="mono-label bg-ink text-base hover:bg-ink-muted rounded px-4 py-2.5 transition-colors"
        >
          Upload
        </Link>
      </div>

      {subjects.length === 0 ? (
        <p className="border-line text-ink-subtle mt-12 rounded-lg border border-dashed px-6 py-16 text-center text-sm">
          Nothing uploaded yet.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Link
              key={s.id}
              href={`/admin/library/${s.slug}`}
              className="border-line hover:bg-surface min-w-0 rounded-xl border p-5 transition-colors"
            >
              <h2 className="truncate text-lg">{s.name}</h2>
              {s.description && (
                <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                  {s.description}
                </p>
              )}
              <p className="mono-label text-ink-subtle mt-5">
                {s.topicCount} topic{s.topicCount === 1 ? "" : "s"} &middot;{" "}
                {s.documentCount} file{s.documentCount === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
