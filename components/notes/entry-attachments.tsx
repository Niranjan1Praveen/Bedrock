"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDelete } from "@/components/notes/confirm-delete";
import {
  cleanUrl,
  IMAGE_ACCEPT,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_BATCH,
  MAX_LABEL,
  MAX_URL,
} from "@/lib/note-limits";

const BUCKET = "notes";

export interface AttachmentView {
  id: string;
  kind: string;
  label: string;
  url: string | null;
  /** A signed link, minted for this page view. Images only. */
  imageUrl: string | null;
}

/**
 * The links and images on one entry, and the controls to add more.
 *
 * Images go from the browser straight to the private bucket with a one-shot
 * ticket, then get recorded once they are there. A failed upload therefore
 * never leaves a broken row behind.
 *
 * Pasting an image anywhere on the page adds it, which is the reason the
 * listener is on the window and not on a field: the natural place to paste a
 * screenshot is wherever the cursor happens to be.
 */
export function EntryAttachments({
  entryId,
  attachments,
}: {
  entryId: string;
  attachments: AttachmentView[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const busy = status !== null;

  const addImages = useCallback(
    async (incoming: File[]) => {
      setError(null);

      const images = incoming.filter((f) => f.type in IMAGE_TYPES);
      if (images.length === 0) {
        setError("Only PNG, JPEG, WebP and GIF images can be added.");
        return;
      }
      if (images.length > MAX_IMAGES_PER_BATCH) {
        setError(`Add ${MAX_IMAGES_PER_BATCH} images at a time at most.`);
        return;
      }
      const tooBig = images.find((f) => f.size > MAX_IMAGE_BYTES);
      if (tooBig) {
        setError(`${tooBig.name} is over the 8MB limit.`);
        return;
      }

      setStatus("Preparing");
      try {
        const res = await fetch("/api/notes/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entryId,
            files: images.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not start the upload.");
          return;
        }

        const supabase = createClient();
        const failed: string[] = [];

        for (const [i, ticket] of (data.tickets as {
          name: string;
          size: number;
          mime: string;
          path: string;
          token: string;
        }[]).entries()) {
          setStatus(`Uploading ${i + 1} of ${images.length}`);
          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .uploadToSignedUrl(ticket.path, ticket.token, images[i], {
              contentType: ticket.mime,
            });
          if (uploadError) {
            failed.push(ticket.name);
            continue;
          }

          const saved = await fetch("/api/notes/attachments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entryId,
              kind: "image",
              storagePath: ticket.path,
              mimeType: ticket.mime,
              sizeBytes: ticket.size,
              label: ticket.name.slice(0, MAX_LABEL),
            }),
          });
          if (!saved.ok) failed.push(ticket.name);
        }

        if (failed.length) setError(`Could not add: ${failed.join(", ")}`);
        router.refresh();
      } catch {
        setError("The upload did not finish. Check your connection and try again.");
      } finally {
        setStatus(null);
      }
    },
    [entryId, router],
  );

  // Paste an image from the clipboard anywhere on the page. Text pastes are
  // left alone, so typing into the entry is unaffected.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter(
        (f) => f.type in IMAGE_TYPES,
      );
      if (files.length === 0) return;
      e.preventDefault();
      void addImages(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addImages]);

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (addingLink) return;
    setError(null);

    if (!cleanUrl(url)) {
      setError("That is not a web address. Use one starting with http or https.");
      return;
    }

    setAddingLink(true);
    const res = await fetch("/api/notes/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, kind: "link", url, label }),
    }).catch(() => null);
    setAddingLink(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error ?? "That did not save. Try again.");
      return;
    }
    setLabel("");
    setUrl("");
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/notes/attachments/${id}`, { method: "DELETE" }).catch(
      () => null,
    );
    if (!res?.ok) return "That did not delete. Try again.";
    router.refresh();
    return null;
  }

  const images = attachments.filter((a) => a.kind === "image");
  const links = attachments.filter((a) => a.kind === "link");

  return (
    <div>
      <h2 className="mono-label text-ink-subtle">Attachments</h2>

      {/* Images */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addImages(Array.from(e.dataTransfer.files));
        }}
        className={`mt-4 rounded-xl border border-dashed px-5 py-6 text-center transition-colors ${
          dragging ? "border-ink bg-surface" : "border-line"
        }`}
      >
        <p className="text-ink-muted text-sm">
          Drop images here, paste one from the clipboard, or{" "}
          <button
            type="button"
            disabled={busy}
            onClick={() => picker.current?.click()}
            className="text-ink underline underline-offset-4 disabled:opacity-50"
          >
            choose files
          </button>
          .
        </p>
        <p className="text-ink-subtle mt-2 text-xs">PNG, JPEG, WebP or GIF, up to 8MB each.</p>
        <input
          ref={picker}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            const chosen = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (chosen.length) void addImages(chosen);
          }}
        />
        {status && (
          <p className="mono-label text-ink mt-4" role="status">
            {status}
          </p>
        )}
      </div>

      {/* Links */}
      <form onSubmit={addLink} className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={MAX_LABEL}
            placeholder="Label (optional)"
            aria-label="Link label"
            className="border-line bg-surface text-ink placeholder:text-ink-subtle focus:border-ink-subtle min-w-0 rounded border px-3 py-2.5 text-sm outline-none transition-colors sm:w-48"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            maxLength={MAX_URL}
            placeholder="https://"
            aria-label="Link address"
            inputMode="url"
            autoComplete="off"
            className="border-line bg-surface text-ink placeholder:text-ink-subtle focus:border-ink-subtle min-w-0 flex-1 rounded border px-3 py-2.5 text-sm outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={addingLink || !url.trim()}
            className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink shrink-0 rounded border px-4 py-2.5 transition-colors disabled:opacity-40"
          >
            {addingLink ? "Adding" : "Add link"}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="border-hard/40 text-hard mt-4 border-l pl-3 text-sm">
          {error}
        </p>
      )}

      {attachments.length === 0 && (
        <p className="text-ink-subtle mt-6 text-sm">Nothing attached yet.</p>
      )}

      {images.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                      className="max-h-72 w-full object-contain"
                    />
                  </a>
                ) : (
                  <p className="text-ink-subtle px-4 py-10 text-center text-sm">
                    This image could not be loaded.
                  </p>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-ink-subtle min-w-0 truncate text-sm">{a.label}</span>
                <ConfirmDelete label="Remove" prompt="Remove this image?" onConfirm={() => remove(a.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {links.length > 0 && (
        <ul className="border-line mt-6 border-t">
          {links.map((a) => (
            <li
              key={a.id}
              className="border-line flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b py-3"
            >
              <a
                href={a.url ?? undefined}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink-muted hover:text-ink min-w-0 truncate text-sm underline underline-offset-4 transition-colors"
              >
                {a.label}
              </a>
              <ConfirmDelete label="Remove" prompt="Remove this link?" onConfirm={() => remove(a.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
