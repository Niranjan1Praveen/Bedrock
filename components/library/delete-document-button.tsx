"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Two deliberate clicks, matching the blog's delete control. */
export function DeleteDocumentButton({
  id,
  title,
  backTo,
}: {
  id: string;
  title: string;
  backTo: string;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/library/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Delete failed with ${res.status}`);
      setBusy(false);
      setArmed(false);
      return;
    }
    router.replace(backTo);
    router.refresh();
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="mono-label text-ink-subtle hover:text-hard shrink-0 transition-colors"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-3">
      <span className="mono-label text-hard">Delete &ldquo;{title}&rdquo;?</span>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="mono-label border-hard/50 text-hard bg-hard/8 hover:bg-hard/15 rounded border px-2.5 py-1 transition-colors disabled:opacity-50"
      >
        {busy ? "Deleting" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="mono-label text-ink-subtle hover:text-ink transition-colors"
      >
        Cancel
      </button>
      {error && <span className="text-hard text-sm">{error}</span>}
    </span>
  );
}
