"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MonoLabel } from "@/components/ui/mono-label";
import { createClient } from "@/lib/supabase/client";
import { ACCEPT_ATTRIBUTE, isAccepted, mimeOf } from "@/lib/file-types";

interface TreeSubject {
  id: string;
  name: string;
  slug: string;
  topics: { id: string; name: string; slug: string }[];
}

type Status = "queued" | "uploading" | "done" | "failed";

interface Item {
  file: File;
  status: Status;
  error?: string;
}

const MAX_BYTES = 50 * 1024 * 1024;
const BUCKET = "library";
/** Uploads run a few at a time: all at once starves a home connection. */
const CONCURRENCY = 3;

/**
 * Uploads a batch of PDFs into one subject and topic.
 *
 * The files go straight from the browser to Supabase Storage using one-shot
 * tickets minted by the server. They never pass through an API route, which is
 * what allows 50MB files: a serverless request body is capped near 4.5MB, so
 * proxying them would work locally and fail in production.
 */
export function UploadForm({ tree }: { tree: TreeSubject[] }) {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Topic suggestions narrow to the chosen subject once it matches one.
  const matched = tree.find(
    (s) => s.name.toLowerCase() === subject.trim().toLowerCase(),
  );

  useEffect(() => {
    if (done) {
      const id = setTimeout(() => setDone(null), 6000);
      return () => clearTimeout(id);
    }
  }, [done]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const incoming: Item[] = [];
    for (const file of Array.from(list)) {
      if (!isAccepted(file.type, file.name)) {
        setError(`${file.name} is not a PDF, DOCX or PPTX and was skipped.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is over the 50MB limit and was skipped.`);
        continue;
      }
      incoming.push({ file, status: "queued" });
    }
    setItems((prev) => {
      // Same name and size twice in one batch is almost certainly a mistake.
      const seen = new Set(prev.map((i) => `${i.file.name}:${i.file.size}`));
      return [...prev, ...incoming.filter((i) => !seen.has(`${i.file.name}:${i.file.size}`))];
    });
  }

  function mark(index: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function upload() {
    if (!subject.trim() || !topic.trim() || items.length === 0) return;
    setBusy(true);
    setError(null);
    setDone(null);

    const pending = items
      .map((it, index) => ({ it, index }))
      .filter(({ it }) => it.status !== "done");

    // One round trip for the whole batch: creates the subject and topic if
    // they are new and returns an upload ticket per file.
    let payload: {
      topic: { id: string; slug: string; name: string };
      subject: { slug: string };
      tickets: {
        name: string;
        size: number;
        mime: string;
        path: string;
        token: string;
      }[];
    };
    try {
      const res = await fetch("/api/library/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          files: pending.map(({ it }) => ({
            name: it.file.name,
            size: it.file.size,
            type: mimeOf(it.file.name, it.file.type),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Failed with ${res.status}`);
      payload = data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the upload");
      setBusy(false);
      return;
    }

    const supabase = createClient();
    const uploaded: {
      title: string;
      storagePath: string;
      sizeBytes: number;
      mimeType: string;
    }[] = [];

    // A small worker pool rather than Promise.all over everything.
    let cursor = 0;
    async function worker() {
      while (cursor < pending.length) {
        const slot = cursor++;
        const { it, index } = pending[slot];
        const ticket = payload.tickets[slot];
        if (!ticket) continue;

        mark(index, { status: "uploading", error: undefined });
        const { error } = await supabase.storage
          .from(BUCKET)
          .uploadToSignedUrl(ticket.path, ticket.token, it.file, {
            contentType: ticket.mime,
          });

        if (error) {
          mark(index, { status: "failed", error: error.message });
        } else {
          mark(index, { status: "done" });
          uploaded.push({
            title: it.file.name,
            storagePath: ticket.path,
            sizeBytes: it.file.size,
            mimeType: ticket.mime,
          });
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker),
    );

    // Rows are written only for files whose bytes actually landed, so a failed
    // upload never shows up as a broken entry in the listing.
    if (uploaded.length > 0) {
      try {
        const res = await fetch("/api/library/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId: payload.topic.id, documents: uploaded }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Failed with ${res.status}`);
        setDone(
          `${data.created} file${data.created === 1 ? "" : "s"} added to ${payload.subject.slug} / ${payload.topic.slug}.`,
        );
        router.refresh();
      } catch (e) {
        setError(
          e instanceof Error
            ? `Files uploaded but could not be recorded: ${e.message}`
            : "Files uploaded but could not be recorded",
        );
      }
    }

    setBusy(false);
  }

  const queued = items.filter((i) => i.status !== "done").length;
  const canUpload = Boolean(subject.trim() && topic.trim() && queued > 0 && !busy);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="subject" className="mono-label text-ink-subtle">
            Subject
          </label>
          <input
            id="subject"
            list="subject-options"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Computer Networks"
            className="border-line bg-surface text-ink focus:border-ink-subtle mt-2.5 w-full rounded border px-3 py-2.5 outline-none transition-colors"
          />
          <datalist id="subject-options">
            {tree.map((s) => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
          <p className="text-ink-subtle mt-2 text-sm">
            Pick an existing one or type a new name to create it.
          </p>
        </div>

        <div className="min-w-0">
          <label htmlFor="topic" className="mono-label text-ink-subtle">
            Sub-topic
          </label>
          <input
            id="topic"
            list="topic-options"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Transport Layer"
            className="border-line bg-surface text-ink focus:border-ink-subtle mt-2.5 w-full rounded border px-3 py-2.5 outline-none transition-colors"
          />
          <datalist id="topic-options">
            {(matched?.topics ?? []).map((t) => (
              <option key={t.id} value={t.name} />
            ))}
          </datalist>
          <p className="text-ink-subtle mt-2 text-sm">
            {matched
              ? `${matched.topics.length} existing in ${matched.name}.`
              : "New subject, so this will be its first topic."}
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border border-dashed px-6 py-12 text-center transition-colors ${
          dragging ? "border-ink bg-surface" : "border-line"
        }`}
      >
        <p className="text-ink-muted text-sm">
          Drop files here, as many as you like.
        </p>
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink mt-5 rounded border px-4 py-2.5 transition-colors"
        >
          Choose files
        </button>
        <input
          ref={input}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-ink-subtle mt-4 text-sm">
          PDF, DOCX or PPTX, up to 50MB each, 25 at a time.
        </p>
      </div>

      {items.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <MonoLabel>
              {items.length} file{items.length === 1 ? "" : "s"}
            </MonoLabel>
            {!busy && (
              <button
                type="button"
                onClick={() => setItems([])}
                className="mono-label text-ink-subtle hover:text-ink transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <ul className="border-line mt-4 border-t">
            {items.map((it, i) => (
              <li
                key={`${it.file.name}-${i}`}
                className="border-line flex items-center gap-4 border-b py-3"
              >
                <span className="text-ink-muted min-w-0 flex-1 truncate text-sm">
                  {it.file.name}
                </span>
                <span className="mono-label text-ink-subtle shrink-0">
                  {(it.file.size / 1048576).toFixed(1)}MB
                </span>
                <span
                  className={`mono-label w-20 shrink-0 text-right ${
                    it.status === "done"
                      ? "text-accent"
                      : it.status === "failed"
                        ? "text-hard"
                        : it.status === "uploading"
                          ? "text-ink"
                          : "text-ink-subtle"
                  }`}
                  title={it.error}
                >
                  {it.status}
                </span>
                {!busy && it.status !== "done" && (
                  <button
                    type="button"
                    onClick={() => setItems((p) => p.filter((_, n) => n !== i))}
                    className="mono-label text-ink-subtle hover:text-hard shrink-0 transition-colors"
                    aria-label={`Remove ${it.file.name}`}
                  >
                    &times;
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="border-hard/40 text-hard border-l pl-3 text-sm">{error}</p>
      )}
      {done && (
        <p className="border-accent/40 text-accent border-l pl-3 text-sm">{done}</p>
      )}

      <div className="border-line border-t pt-6">
        <button
          type="button"
          disabled={!canUpload}
          onClick={upload}
          className="mono-label bg-ink text-base hover:bg-ink-muted rounded px-5 py-3 transition-colors disabled:opacity-40"
        >
          {busy ? "Uploading" : `Upload ${queued || ""}`.trim()}
        </button>
      </div>
    </div>
  );
}
