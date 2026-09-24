"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_TITLE } from "@/lib/note-limits";

type Props = { kind: "topic" } | { kind: "entry"; topicId: string };

/**
 * One text box and a button, used for both things that start with a name: a
 * new title on the index, and a new entry inside a title.
 *
 * On success it goes straight to the page that was made -- a title opens to
 * its list of entries, an entry opens to its editor -- because an empty new
 * thing is only ever wanted in order to fill it.
 *
 * Takes a `kind` rather than an endpoint and a function to work out where to
 * go: this is rendered from server pages, and a function cannot be passed
 * across that boundary.
 */
export function NewTitleForm(props: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTopic = props.kind === "topic";
  const placeholder = isTopic ? "A new title, e.g. Interviews" : "A new entry, e.g. Introduction";
  const button = isTopic ? "Add title" : "Add entry";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !title.trim()) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(isTopic ? "/api/notes/topics" : "/api/notes/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          props.kind === "entry" ? { title, topicId: props.topicId } : { title },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "That did not save. Try again.");
        return;
      }
      router.push(
        isTopic
          ? `/admin/notes/${data.topic.slug}`
          : `/admin/notes/${data.topicSlug}/${data.entry.slug}`,
      );
      router.refresh();
    } catch {
      setError("That did not save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={`new-${props.kind}`}>
          {placeholder}
        </label>
        <input
          id={`new-${props.kind}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE}
          placeholder={placeholder}
          autoComplete="off"
          className="border-line bg-surface text-ink placeholder:text-ink-subtle focus:border-ink-subtle min-w-0 flex-1 rounded border px-3 py-2.5 text-sm outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="mono-label bg-ink text-base hover:bg-ink-muted shrink-0 rounded px-4 py-2.5 transition-colors disabled:opacity-40"
        >
          {busy ? "Adding" : button}
        </button>
      </div>
      {error && (
        <p className="border-hard/40 text-hard mt-3 border-l pl-3 text-sm">{error}</p>
      )}
    </form>
  );
}
