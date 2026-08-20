"use client";

import { useState } from "react";
import Link from "next/link";
import { MonoLabel } from "@/components/ui/mono-label";
import { formatBytes } from "@/lib/format";

export interface TopicDocument {
  id: string;
  slug: string;
  title: string;
  sizeBytes: number;
  pageCount: number | null;
}

/**
 * One topic and its files, collapsible.
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
  topic: { id: string; slug: string; name: string; documents: TopicDocument[] };
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const count = topic.documents.length;

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
          <span className="min-w-0">
            <span className="text-ink block truncate">{topic.name}</span>
            <MonoLabel className="mt-1.5 block">
              {count} file{count === 1 ? "" : "s"}
            </MonoLabel>
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
        <ul id={`topic-${topic.id}`} className="border-line border-t">
          {count === 0 && (
            <li className="text-ink-subtle px-5 py-5 text-sm">
              Nothing in this topic yet.
            </li>
          )}
          {topic.documents.map((doc) => (
            <li key={doc.id} className="border-line-soft border-b last:border-b-0">
              <Link
                href={`/admin/library/${subjectSlug}/${topic.slug}/${doc.slug}`}
                className="group hover:bg-surface flex items-center gap-4 px-5 py-4 transition-colors"
              >
                <span className="mono-label text-ink-subtle border-line shrink-0 rounded border px-1.5 py-0.5">
                  PDF
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-ink-muted group-hover:text-ink block truncate text-sm transition-colors">
                    {doc.title}
                  </span>
                </span>
                <span className="mono-label text-ink-subtle shrink-0 text-right">
                  {doc.pageCount ? `${doc.pageCount}p · ` : ""}
                  {formatBytes(doc.sizeBytes)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
