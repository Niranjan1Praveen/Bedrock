"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * One message, with its read state and a delete.
 *
 * The row keeps its own optimistic copy of `read` so the toggle responds
 * immediately, then refreshes the route so the unread count in the heading
 * comes from the database rather than being tracked twice.
 */
export function MessageRow({
  id,
  email,
  message,
  read,
  sentAt,
}: {
  id: string;
  email: string;
  message: string;
  read: boolean;
  sentAt: string;
}) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(read);
  const [deleted, setDeleted] = useState(false);
  const [pending, startTransition] = useTransition();

  const toggleRead = async () => {
    const next = !isRead;
    setIsRead(next);
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: next }),
    }).catch(() => setIsRead(!next));
    startTransition(() => router.refresh());
  };

  const remove = async () => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setDeleted(true);
    const res = await fetch(`/api/contact/${id}`, { method: "DELETE" }).catch(
      () => null,
    );
    if (!res?.ok) {
      setDeleted(false);
      return;
    }
    startTransition(() => router.refresh());
  };

  if (deleted) return null;

  return (
    <li className={`border-line border-b py-6 ${pending ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex min-w-0 items-baseline gap-3">
          {!isRead && (
            <span
              aria-label="Unread"
              className="bg-accent size-1.5 shrink-0 rounded-full"
            />
          )}
          <a
            href={`mailto:${email}`}
            className="text-ink hover:text-ink-muted truncate text-lg underline underline-offset-4 transition-colors"
          >
            {email}
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="mono-label text-ink-subtle">{sentAt}</span>
          <button
            type="button"
            onClick={toggleRead}
            className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded border px-2.5 py-1.5 transition-colors"
          >
            {isRead ? "Unread" : "Read"}
          </button>
          <button
            type="button"
            onClick={remove}
            className="mono-label text-ink-subtle hover:text-hard transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-ink-muted mt-4 max-w-3xl leading-relaxed whitespace-pre-wrap">
        {message}
      </p>
    </li>
  );
}
