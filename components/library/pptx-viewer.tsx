"use client";

import { useEffect, useRef, useState } from "react";
import {
  RenderFallback,
  ScrollTopButton,
  ViewerToolbar,
  useSignedUrl,
} from "@/components/library/viewer-parts";
import { RevisedToggle } from "@/components/library/revised-toggle";

/**
 * Slide decks, rendered in the page.
 *
 * pptx-preview parses the deck in the browser, so the file never leaves the
 * private bucket and no third party ever sees it -- which is the whole reason
 * the bucket is private. The trade-off is fidelity: complex slides will not
 * match PowerPoint exactly, and when parsing fails the fallback offers the
 * file instead of leaving it unreadable.
 *
 * Imported dynamically. The library pulls in a charting dependency of roughly a
 * megabyte, which has no business being in the bundle of any other page.
 */
export function PptxViewer({
  documentId,
  title,
  fileName,
  revised,
}: {
  documentId: string;
  title: string;
  fileName: string;
  revised: boolean;
}) {
  const { url, error, retry } = useSignedUrl(documentId);
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [message, setMessage] = useState("");
  const [width, setWidth] = useState(0);

  // Render slides at the container's width so a deck fits a phone screen
  // without scrolling sideways.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!url || !container.current || !width) return;
    let cancelled = false;
    const target = container.current;
    setState("loading");

    (async () => {
      try {
        const { init } = await import("pptx-preview");
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed with ${res.status}`);
        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        target.replaceChildren();
        const previewer = init(target, {
          width: Math.max(320, width),
          // 4:3 is the safer default; the library corrects to the deck's own
          // ratio once it has parsed the slide master.
          height: Math.round(Math.max(320, width) * 0.75),
        });
        await previewer.preview(buffer);
        if (!cancelled) setState("ready");
      } catch (e) {
        if (cancelled) return;
        setMessage(
          e instanceof Error
            ? `This deck could not be rendered: ${e.message}`
            : "This deck could not be rendered.",
        );
        setState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, width]);

  if (error) {
    return (
      <RenderFallback
        message={error}
        fileName={fileName}
        signedUrl={url}
        onRetry={retry}
      />
    );
  }

  return (
    <div>
      <ViewerToolbar
        status={state === "ready" ? "Slides" : state === "failed" ? "Could not render" : "Loading"}
      />

      <div className="border-line bg-surface scroll-x rounded-b-xl border border-t-0 p-3 sm:p-5">
        {state === "failed" && (
          <RenderFallback
            message={message}
            fileName={fileName}
            signedUrl={url}
            onRetry={retry}
          />
        )}
        {state === "loading" && (
          <div className="bg-line/40 h-[60vh] w-full animate-pulse rounded" />
        )}
        {/* Measured even while loading, so the ResizeObserver has a box to
            report before the deck is parsed. */}
        <div
          ref={container}
          className={`pptx-host w-full ${state === "ready" ? "" : "h-0 overflow-hidden"}`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-ink-subtle text-sm">{title}</p>
        <RevisedToggle documentId={documentId} revised={revised} size="md" />
      </div>

      <ScrollTopButton />
    </div>
  );
}
