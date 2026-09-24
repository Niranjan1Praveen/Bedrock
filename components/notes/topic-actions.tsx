"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDelete } from "@/components/notes/confirm-delete";
import { MAX_TITLE } from "@/lib/note-limits";

/** Rename and delete for a title, shown in the header of its page. */
export function TopicActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rename(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !value.trim()) return;

    setBusy(true);
    setError(null);
    const res = await fetch(`/api/notes/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: value }),
    }).catch(() => null);
    setBusy(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error ?? "That did not save. Try again.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    const res = await fetch(`/api/notes/topics/${id}`, { method: "DELETE" }).catch(
      () => null,
    );
    if (!res?.ok) return "That did not delete. Try again.";
    router.replace("/admin/notes");
    router.refresh();
    return null;
  }

  if (editing) {
    return (
      <form onSubmit={rename} className="flex flex-wrap items-center gap-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX_TITLE}
          autoFocus
          aria-label="Title"
          className="border-line bg-surface text-ink focus:border-ink-subtle min-w-0 rounded border px-3 py-1.5 text-sm outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded border px-3 py-1.5 transition-colors disabled:opacity-40"
        >
          {busy ? "Saving" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setValue(title);
            setError(null);
          }}
          className="mono-label text-ink-subtle hover:text-ink transition-colors"
        >
          Cancel
        </button>
        {error && <span className="text-hard text-sm">{error}</span>}
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mono-label text-ink-subtle hover:text-ink shrink-0 transition-colors"
      >
        Rename
      </button>
      <ConfirmDelete prompt={`Delete “${title}” and its entries?`} onConfirm={remove} />
    </div>
  );
}
