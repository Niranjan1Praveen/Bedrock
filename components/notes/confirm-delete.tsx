"use client";

import { useState } from "react";

/**
 * Two deliberate clicks, matching the library's and the blog's delete control.
 *
 * `onConfirm` does the work and returns an error message, or null on success.
 * Returning rather than throwing keeps every caller's failure path the same: the
 * control disarms and shows what went wrong beside itself.
 */
export function ConfirmDelete({
  label = "Delete",
  prompt,
  onConfirm,
}: {
  label?: string;
  /** What the second step asks, e.g. `Delete "Introduction"?` */
  prompt: string;
  onConfirm: () => Promise<string | null>;
}) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    const message = await onConfirm();
    setBusy(false);
    setArmed(false);
    if (message) setError(message);
  }

  if (!armed) {
    return (
      <span className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="mono-label text-ink-subtle hover:text-hard shrink-0 transition-colors"
        >
          {label}
        </button>
        {error && <span className="text-hard text-sm">{error}</span>}
      </span>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-3">
      <span className="mono-label text-hard">{prompt}</span>
      <button
        type="button"
        disabled={busy}
        onClick={confirm}
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
    </span>
  );
}
