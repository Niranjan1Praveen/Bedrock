import Link from "next/link";
import type { NoteEntryView } from "@/lib/notes";

/**
 * One entry, read rather than edited: its text as written, then its images and
 * links. A server component -- nothing here needs the browser.
 *
 * The text keeps its own line breaks (`whitespace-pre-wrap`) because it is
 * plain text with no markup: an introduction typed as three paragraphs should
 * read as three paragraphs. `break-words` stops a long pasted address widening
 * the page on a phone.
 */
export function EntryView({
  entry,
  topicSlug,
}: {
  entry: NoteEntryView;
  topicSlug: string;
}) {
  const images = entry.attachments.filter((a) => a.kind === "image");
  const links = entry.attachments.filter((a) => a.kind === "link");

  return (
    <article className="border-line border-t py-10 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="min-w-0 text-2xl break-words">{entry.title}</h2>
        <Link
          href={`/admin/notes/${topicSlug}/${entry.slug}`}
          className="mono-label text-ink-subtle hover:text-ink shrink-0 transition-colors"
        >
          Edit
        </Link>
      </div>

      {entry.body ? (
        <p className="text-ink-muted mt-5 max-w-3xl leading-relaxed break-words whitespace-pre-wrap">
          {entry.body}
        </p>
      ) : (
        <p className="text-ink-subtle mt-5 text-sm">No text yet.</p>
      )}

      {images.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {images.map((a) => (
            <li key={a.id} className="min-w-0">
              <div className="border-line bg-surface-2 overflow-hidden rounded-xl border">
                {a.imageUrl ? (
                  <a href={a.imageUrl} target="_blank" rel="noreferrer noopener">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.imageUrl}
                      alt={a.label}
                      loading="lazy"
                      className="max-h-80 w-full object-contain"
                    />
                  </a>
                ) : (
                  <p className="text-ink-subtle px-4 py-10 text-center text-sm">
                    This image could not be loaded.
                  </p>
                )}
              </div>
              <p className="text-ink-subtle mt-2 truncate text-sm">{a.label}</p>
            </li>
          ))}
        </ul>
      )}

      {links.length > 0 && (
        <ul className="mt-8 space-y-2">
          {links.map((a) => (
            <li key={a.id} className="min-w-0">
              <a
                href={a.url ?? undefined}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink-muted hover:text-ink text-sm break-all underline underline-offset-4 transition-colors"
              >
                {a.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
