"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDelete } from "@/components/notes/confirm-delete";
import {
  EntryAttachments,
  type AttachmentView,
} from "@/components/notes/entry-attachments";
import { MAX_BODY, MAX_TITLE } from "@/lib/note-limits";

/**
 * Writes one entry: its title, its text, and what is attached to it.
 *
 * Saving is explicit rather than continuous. This holds things worth getting
 * right -- an introduction to say aloud, say -- and a save that happens on its
 * own gives no moment at which the text is "the version". What it does do is
 * say plainly when there is something unsaved, and stop the tab closing over
 * it: a change lost silently is the failure that matters here.
 *
 * The text is state seeded from props and never re-read from them. Attaching
 * an image refreshes the page, which hands this fresh props; reading the text
 * from them would throw away whatever had been typed since the last save.
 */
export function EntryEditor({
  entry,
  topicSlug,
  attachments,
}: {
  entry: { id: string; title: string; body: string };
  topicSlug: string;
  attachments: AttachmentView[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(entry.title);
  const [body, setBody] = useState(entry.body);
  const [saved, setSaved] = useState({ title: entry.title, body: entry.body });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = title !== saved.title || body !== saved.body;

  const save = useCallback(async () => {
    if (saving || !dirty) return;
    if (!title.trim()) {
      setError("Give it a title.");
      return;
    }

    setSaving(true);
    setError(null);
    const res = await fetch(`/api/notes/entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    }).catch(() => null);
    setSaving(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error ?? "That did not save. Your text is still here; try again.");
      return;
    }
    setSaved({ title: title.replace(/\s+/g, " ").trim(), body });
    setTitle((t) => t.replace(/\s+/g, " ").trim());
    router.refresh();
  }, [saving, dirty, title, body, entry.id, router]);

  // Ctrl or Cmd + S.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);

  // The browser's own "leave this page?" prompt, only while there is
  // something to lose.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function remove() {
    const res = await fetch(`/api/notes/entries/${entry.id}`, { method: "DELETE" }).catch(
      () => null,
    );
    if (!res?.ok) return "That did not delete. Try again.";
    router.replace(`/admin/notes/${topicSlug}`);
    router.refresh();
    return null;
  }

  return (
    <div>
      <label htmlFor="entry-title" className="mono-label text-ink-subtle block">
        Title
      </label>
      <input
        id="entry-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={MAX_TITLE}
        autoComplete="off"
        className="border-line bg-surface text-ink focus:border-ink-subtle mt-3 w-full rounded border px-3 py-2.5 text-lg outline-none transition-colors"
      />

      <label htmlFor="entry-body" className="mono-label text-ink-subtle mt-8 block">
        Text
      </label>
      <textarea
        id="entry-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={MAX_BODY}
        rows={16}
        placeholder="Write or paste here."
        className="border-line bg-surface text-ink placeholder:text-ink-subtle focus:border-ink-subtle mt-3 min-h-64 w-full resize-y rounded border px-4 py-3 leading-relaxed outline-none transition-colors"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="mono-label bg-ink text-base hover:bg-ink-muted rounded px-5 py-2.5 transition-colors disabled:opacity-40"
          >
            {saving ? "Saving" : "Save"}
          </button>
          <span
            role="status"
            className={`mono-label tabular-nums ${dirty ? "text-warn" : "text-ink-subtle"}`}
          >
            {dirty ? "Unsaved changes" : "Saved"}
          </span>
        </div>
        <span className="mono-label text-ink-subtle tabular-nums">
          {body.length.toLocaleString()} / {MAX_BODY.toLocaleString()}
        </span>
      </div>
      {error && (
        <p role="alert" className="border-hard/40 text-hard mt-4 border-l pl-3 text-sm">
          {error}
        </p>
      )}

      <div className="border-line mt-12 border-t pt-10">
        <EntryAttachments entryId={entry.id} attachments={attachments} />
      </div>

      <div className="border-line mt-12 border-t pt-8">
        <ConfirmDelete
          label="Delete entry"
          prompt={`Delete “${saved.title}”?`}
          onConfirm={remove}
        />
      </div>
    </div>
  );
}
