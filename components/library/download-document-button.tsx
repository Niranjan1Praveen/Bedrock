"use client";

import { useState } from "react";
import { downloadUrl } from "@/components/library/viewer-parts";

/**
 * Downloads one document from the top of its own page.
 *
 * The signed link is minted on click rather than on mount: this sits beside
 * the viewer, which mints its own on mount, and fetching a second one nobody
 * asked for yet on every page load would double that cost for no reason --
 * signed links go unread far more often than a document gets downloaded.
 */
export function DownloadDocumentButton({
  documentId,
  fileName,
}: {
  documentId: string;
  fileName: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");

  async function onClick() {
    if (state === "busy") return;
    setState("busy");

    try {
      const res = await fetch(`/api/library/documents/${documentId}/url`);
      if (!res.ok) throw new Error(String(res.status));
      const { url } = (await res.json()) as { url: string };

      // A programmatic anchor rather than location.assign: this must not
      // navigate the admin page away, only start a save.
      const a = document.createElement("a");
      a.href = downloadUrl(url, fileName);
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "busy"}
      className="mono-label text-ink-subtle hover:text-ink shrink-0 transition-colors disabled:opacity-50"
    >
      {state === "busy" ? "Preparing" : state === "error" ? "Try again" : "Download"}
    </button>
  );
}
