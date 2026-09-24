import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { EntryEditor } from "@/components/notes/entry-editor";
import { getNoteEntry, noteUserId } from "@/lib/notes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/admin/notes/[topic]/[entry]">): Promise<Metadata> {
  const { topic, entry } = await params;
  const userId = await noteUserId();
  const found = userId ? await getNoteEntry(userId, topic, entry) : null;
  return {
    title: found ? found.entry.title : "Notes",
    robots: { index: false, follow: false },
  };
}

export default async function NoteEntryPage({
  params,
}: PageProps<"/admin/notes/[topic]/[entry]">) {
  const { topic, entry } = await params;
  const userId = await noteUserId();
  if (!userId) notFound();

  const found = await getNoteEntry(userId, topic, entry);
  if (!found) notFound();

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mono-label text-ink-subtle flex flex-wrap items-center gap-2">
        <Link href="/admin/notes" className="hover:text-ink transition-colors">
          Notes
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/admin/notes/${found.topic.slug}`}
          className="hover:text-ink transition-colors"
        >
          {found.topic.title}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink truncate">{found.entry.title}</span>
      </nav>

      <div className="mt-8 max-w-3xl">
        <EntryEditor
          entry={{
            id: found.entry.id,
            title: found.entry.title,
            body: found.entry.body,
          }}
          topicSlug={found.topic.slug}
          attachments={found.entry.attachments.map((a) => ({
            id: a.id,
            kind: a.kind,
            label: a.label,
            url: a.url,
            imageUrl: a.imageUrl,
          }))}
        />
      </div>
    </Container>
  );
}
