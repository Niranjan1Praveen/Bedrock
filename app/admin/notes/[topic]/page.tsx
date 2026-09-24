import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { MonoLabel } from "@/components/ui/mono-label";
import { EntryView } from "@/components/notes/entry-view";
import { NewTitleForm } from "@/components/notes/new-title-form";
import { TopicActions } from "@/components/notes/topic-actions";
import { getNoteTopic, noteUserId } from "@/lib/notes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/admin/notes/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  const userId = await noteUserId();
  const found = userId ? await getNoteTopic(userId, topic) : null;
  return {
    title: found ? found.title : "Notes",
    robots: { index: false, follow: false },
  };
}

export default async function NoteTopicPage({
  params,
}: PageProps<"/admin/notes/[topic]">) {
  const { topic } = await params;
  const userId = await noteUserId();
  if (!userId) notFound();

  // Looked up by this account's id as well as the address, so another
  // account's title of the same name is simply not found here.
  const found = await getNoteTopic(userId, topic);
  if (!found) notFound();

  return (
    <Container className="py-16 sm:py-20">
      <nav className="mono-label text-ink-subtle flex items-center gap-2">
        <Link href="/admin/notes" className="hover:text-ink transition-colors">
          Notes
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink truncate">{found.title}</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-3xl break-words">{found.title}</h1>
          <MonoLabel className="mt-3 block">
            {found.entries.length} {found.entries.length === 1 ? "entry" : "entries"}
          </MonoLabel>
        </div>
        <TopicActions id={found.id} title={found.title} />
      </div>

      <div className="mt-10 max-w-xl">
        <NewTitleForm kind="entry" topicId={found.id} />
      </div>

      <div className="mt-12">
        {found.entries.length === 0 ? (
          <p className="border-line text-ink-subtle rounded-lg border border-dashed px-6 py-16 text-center text-sm">
            Nothing under this title yet.
          </p>
        ) : (
          found.entries.map((entry) => (
            <EntryView key={entry.id} entry={entry} topicSlug={found.slug} />
          ))
        )}
      </div>
    </Container>
  );
}
