"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MonoLabel } from "@/components/ui/mono-label";
import { SubjectCover } from "@/components/library/subject-cover";

/**
 * The cover for one subject, with upload and reset.
 *
 * Covers belong to a subject only, never to a topic. With none uploaded the
 * generated pattern shows through, so there is never an empty placeholder and
 * resetting is a real option rather than a way to end up with nothing.
 */
export function SubjectCoverField({
  slug,
  imageUrl,
}: {
  slug: string;
  imageUrl: string | null;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(imageUrl);

  async function upload(file: File) {
    setBusy(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`/api/library/subjects/${slug}/image`, {
      method: "POST",
      body,
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? `Upload failed with ${res.status}`);
      return;
    }
    setCurrent(data.url);
    router.refresh();
  }

  async function reset() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/library/subjects/${slug}/image`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not reset the cover");
      return;
    }
    setCurrent(null);
    router.refresh();
  }

  return (
    <div>
      <MonoLabel>Cover</MonoLabel>

      <div className="border-line mt-3 overflow-hidden rounded-xl border">
        <SubjectCover slug={slug} imageUrl={current} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded border px-3 py-2 transition-colors disabled:opacity-50"
        >
          {busy ? "Working" : current ? "Replace" : "Upload"}
        </button>
        {current && (
          <button
            type="button"
            disabled={busy}
            onClick={reset}
            className="mono-label text-ink-subtle hover:text-ink transition-colors disabled:opacity-50"
          >
            Use generated
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-ink-subtle mt-2 text-sm">
        {current
          ? "Uploaded image. Up to 4MB."
          : "Generated from the subject name. Upload one to replace it."}
      </p>

      {error && <p className="text-hard mt-2 text-sm">{error}</p>}
    </div>
  );
}
