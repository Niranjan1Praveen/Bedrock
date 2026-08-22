"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Marks one document, or a whole topic, as revised for the signed-in user.
 *
 * Optimistic: the control flips immediately and rolls back if the request
 * fails, because waiting on a round trip to tick a checkbox feels broken. The
 * user id is never sent -- the server reads it from the verified session, so
 * one account cannot write another's progress.
 */
export function RevisedToggle({
  documentId,
  topicId,
  revised,
  label,
  size = "sm",
}: {
  documentId?: string;
  topicId?: string;
  revised: boolean;
  label?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [on, setOn] = useState(revised);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    // These sit inside link rows; without this the row navigates instead.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !on;
    setOn(next);
    setBusy(true);

    try {
      const res = await fetch("/api/library/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, topicId, revised: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
      start(() => router.refresh());
    } catch {
      setOn(!next); // put it back
    } finally {
      setBusy(false);
    }
  }

  const pad = size === "md" ? "px-3 py-2" : "px-2 py-1";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      disabled={busy || pending}
      title={on ? "Marked as revised" : "Mark as revised"}
      className={`mono-label shrink-0 rounded border transition-colors ${pad} ${
        on
          ? "border-accent/50 text-accent bg-accent/8"
          : "border-line text-ink-subtle hover:border-ink-subtle hover:text-ink"
      } ${busy ? "opacity-60" : ""}`}
    >
      {on ? "Revised" : (label ?? "Mark")}
    </button>
  );
}
