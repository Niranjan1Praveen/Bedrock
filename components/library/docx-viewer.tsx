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
 * Word documents, rendered in the page.
 *
 * docx-preview reproduces Word's own layout -- page boxes, columns, tables,
 * spacing -- rather than reflowing to semantic HTML, so a document whose
 * formatting carries meaning still reads correctly. It renders onto white
 * pages inside the dark chrome, matching how the PDF viewer already looks.
 *
 * The library is imported dynamically: it is only needed on this route, and
 * keeping it out of the shared bundle costs nothing here.
 */
export function DocxViewer({
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

  useEffect(() => {
    if (!url || !container.current) return;
    let cancelled = false;
    const target = container.current;
    setState("loading");

    (async () => {
      try {
        const { renderAsync } = await import("docx-preview");
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed with ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;

        target.replaceChildren();
        await renderAsync(blob, target, undefined, {
          className: "docx",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
          experimental: true,
        });
        if (!cancelled) setState("ready");
      } catch (e) {
        if (cancelled) return;
        setMessage(
          e instanceof Error
            ? `This document could not be rendered: ${e.message}`
            : "This document could not be rendered.",
        );
        setState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

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
        status={state === "ready" ? "Word document" : state === "failed" ? "Could not render" : "Loading"}
      />

      <div className="border-line bg-surface scroll-x rounded-b-xl border border-t-0 p-3 sm:p-5">
        {state === "failed" ? (
          <RenderFallback
            message={message}
            fileName={fileName}
            signedUrl={url}
            onRetry={retry}
          />
        ) : (
          <>
            {state === "loading" && (
              <div className="bg-line/40 h-[70vh] w-full animate-pulse rounded" />
            )}
            {/* docx-preview writes its own page elements in here. The wrapper
                keeps its fixed-width pages scrollable on a phone instead of
                widening the page. */}
            <div
              ref={container}
              className={`docx-host ${state === "ready" ? "" : "hidden"}`}
            />
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-ink-subtle text-sm">{title}</p>
        <RevisedToggle documentId={documentId} revised={revised} size="md" />
      </div>

      <ScrollTopButton />
    </div>
  );
}
