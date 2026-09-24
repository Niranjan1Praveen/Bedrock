import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { NewTitleForm } from "@/components/notes/new-title-form";
import { listNoteTopics, noteUserId } from "@/lib/notes";
import { formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Notes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const userId = await noteUserId();
  const topics = userId ? await listNoteTopics(userId) : [];

  return (
    <Container className="py-16 sm:py-20">
      <MonoLabel>Notes</MonoLabel>
      <h1 className="mt-4 text-3xl">Titles</h1>
      <p className="text-ink-subtle mt-3 max-w-xl text-sm leading-relaxed">
        Text, images and links kept under a title of your choosing. Each title
        holds entries, and each entry has its own page. Nothing here is linked to
        the library, and only you can see it.
      </p>

      <div className="mt-10 max-w-xl">
        <NewTitleForm kind="topic" />
      </div>

      {topics.length === 0 ? (
        <p className="border-line text-ink-subtle mt-12 rounded-lg border border-dashed px-6 py-16 text-center text-sm">
          No titles yet.
        </p>
      ) : (
        <ul className="border-line mt-12 border-t">
          {topics.map((t) => (
            <li key={t.id} className="border-line border-b">
              <Link
                href={`/admin/notes/${t.slug}`}
                className="group hover:bg-surface flex flex-col gap-2 px-2 py-5 transition-colors sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="text-ink-muted group-hover:text-ink min-w-0 flex-1 truncate transition-colors">
                  {t.title}
                </span>
                <span className="mono-label text-ink-subtle shrink-0 tabular-nums">
                  {t.entryCount} {t.entryCount === 1 ? "entry" : "entries"}
                </span>
                <span className="mono-label text-ink-subtle shrink-0 sm:w-40 sm:text-right">
                  {formatDate(t.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
