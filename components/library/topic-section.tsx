"use client";

import { useState } from "react";
import Link from "next/link";
import { MonoLabel } from "@/components/ui/mono-label";
import { ProgressBar } from "@/components/library/progress-bar";
import { RevisedToggle } from "@/components/library/revised-toggle";
import { formatBytes } from "@/lib/format";

export interface TopicDocument {
  id: string;
  slug: string;
  title: string;
  sizeBytes: number;
  pageCount: number | null;
  revised: boolean;
}

/**
 * One topic and its files, collapsible, with this user's progress through it.
 *
 * Collapsing matters most on a phone: a subject with a dozen topics and forty
 * files is a wall of text otherwise, and the point of this page is finding one
 * document quickly.
 */
export function TopicSection({
  subjectSlug,
  topic,
  defaultOpen = false,
}: {
  subjectSlug: string;
  topic: {
    id: string;
    slug: string;
    name: string;
    documents: TopicDocument[];
    revisedCount: number;
  };
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const count = topic.documents.length;
  const done = topic.revisedCount;
  const complete = count > 0 && done === count;

  return (
    <section className="border-line overflow-hidden rounded-xl border">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`topic-${topic.id}`}
          className="hover:bg-surface flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
        >
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2.5">
              <span className="text-ink truncate">{topic.name}</span>
              {complete && (
                <span className="mono-label text-accent shrink-0">Done</span>
              )}
            </span>
            <span className="mt-2 block max-w-xs">
              <ProgressBar done={done} total={count} />
            </span>
          </span>
          <span
            aria-hidden
            className={`text-ink-subtle shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          >
            &darr;
          </span>
        </button>
      </h2>

      {open && (
        <div id={`topic-${topic.id}`} className="border-line border-t">
          {count > 0 && (
            <div className="border-line-soft flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
              <MonoLabel>
                {count} file{count === 1 ? "" : "s"}
              </MonoLabel>
              {/* Marking a whole unit at once, rather than tapping forty rows. */}
              <RevisedToggle
                topicId={topic.id}
                revised={complete}
                label="Mark all"
              />
            </div>
          )}

          <ul>
            {count === 0 && (
              <li className="text-ink-subtle px-5 py-5 text-sm">
                Nothing in this topic yet.
              </li>
            )}
            {topic.documents.map((doc) => (
              <li
                key={doc.id}
                className="border-line-soft border-b last:border-b-0"
              >
                <Link
                  href={`/admin/library/${subjectSlug}/${topic.slug}/${doc.slug}`}
                  className="group hover:bg-surface flex items-center gap-3 px-5 py-4 transition-colors sm:gap-4"
                >
                  <span className="mono-label text-ink-subtle border-line hidden shrink-0 rounded border px-1.5 py-0.5 sm:inline">
                    PDF
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm transition-colors ${
                        doc.revised
                          ? "text-ink-subtle"
                          : "text-ink-muted group-hover:text-ink"
                      }`}
                    >
                      {doc.title}
                    </span>
                    <span className="mono-label text-ink-subtle mt-1 block">
                      {doc.pageCount ? `${doc.pageCount}p · ` : ""}
                      {formatBytes(doc.sizeBytes)}
                    </span>
                  </span>
                  <RevisedToggle documentId={doc.id} revised={doc.revised} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
