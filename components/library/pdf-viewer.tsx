"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { RevisedToggle } from "@/components/library/revised-toggle";

// pdf.js parses in a worker. Resolving it through import.meta.url lets the
// bundler emit it as an asset rather than requiring a copy in /public that
// could drift out of step with the installed version.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * Continuous-scroll PDF reader.
 *
 * Rendered by us rather than handed to the browser's built-in viewer, because
 * that viewer is inconsistent on mobile -- iOS Safari commonly shows only the
 * first page of an embedded PDF -- and comes with its own download and print
 * buttons.
 *
 * The file arrives on a signed URL that expires, fetched only after the
 * session has been checked. Worth being clear-eyed: the bytes must reach the
 * browser for any of this to render, so this stops links leaking, not a
 * determined person with devtools.
 */
export function PdfViewer({
  documentId,
  title,
  initialPageCount,
  revised,
}: {
  documentId: string;
  title: string;
  initialPageCount?: number | null;
  revised: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState(initialPageCount ?? 0);
  const [current, setCurrent] = useState(1);
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState(0);

  const [showTop, setShowTop] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reported = useRef(false);

  // Fetch the signed URL. Deliberately not stored in the page HTML, so it
  // cannot be scraped from a cached document.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/library/documents/${documentId}/url`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { url: string }) => {
        if (!cancelled) setUrl(d.url);
      })
      .catch(() => {
        if (!cancelled) setError("Could not open that file. Try reloading.");
      });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  // Render pages to the container's width so the document fits the screen on a
  // phone without horizontal scrolling.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Show the jump-to-top control once there is enough behind you to make
  // scrolling back a chore. Passive listener so it never blocks scrolling,
  // and rAF-throttled so a long document does not fire setState per frame.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowTop(window.scrollY > 800);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which page is in view, for the counter.
  useEffect(() => {
    if (!pages) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const n = Number((visible.target as HTMLElement).dataset.page);
          if (n) setCurrent(n);
        }
      },
      { threshold: [0.1, 0.5] },
    );
    pageRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [pages]);

  const onLoad = useCallback(
    ({ numPages }: { numPages: number }) => {
      setPages(numPages);
      // Record the page count once, so listings can show it without opening
      // every file.
      if (!reported.current && numPages && numPages !== initialPageCount) {
        reported.current = true;
        fetch(`/api/library/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageCount: numPages }),
        }).catch(() => {});
      }
    },
    [documentId, initialPageCount],
  );

  const jump = (n: number) => {
    const el = pageRefs.current[n - 1];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (error) {
    return (
      <div className="border-line rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="text-ink-muted text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls. Sticky so they stay reachable on a long document. */}
      <div className="border-line bg-surface-2 sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 rounded-t-xl border px-4 py-2.5">
        <span className="mono-label text-ink-subtle tabular-nums">
          {pages ? `Page ${current} of ${pages}` : "Loading"}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors"
          >
            Top
          </button>
          <span className="bg-line mx-1.5 h-4 w-px" aria-hidden />
          <button
            type="button"
            onClick={() => jump(Math.max(1, current - 1))}
            disabled={current <= 1}
            className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors disabled:opacity-30"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => jump(Math.min(pages, current + 1))}
            disabled={!pages || current >= pages}
            className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors disabled:opacity-30"
          >
            Next
          </button>
          <span className="bg-line mx-1.5 h-4 w-px" aria-hidden />
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
            className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors"
            aria-label="Zoom out"
          >
            &minus;
          </button>
          <span className="mono-label text-ink-subtle w-12 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={frame}
        className="border-line bg-surface scroll-x rounded-b-xl border border-t-0 p-3 sm:p-5"
      >
        {!url ? (
          <div className="bg-line/40 h-[70vh] w-full animate-pulse rounded" />
        ) : (
          <Document
            file={url}
            onLoadSuccess={onLoad}
            onLoadError={() => setError("That file could not be read as a PDF.")}
            loading={
              <div className="bg-line/40 h-[70vh] w-full animate-pulse rounded" />
            }
            error={
              <p className="text-ink-muted py-16 text-center text-sm">
                That file could not be read as a PDF.
              </p>
            }
          >
            <div className="space-y-4">
              {Array.from({ length: pages }, (_, i) => (
                <div
                  key={i}
                  data-page={i + 1}
                  ref={(el) => {
                    pageRefs.current[i] = el;
                  }}
                  className="border-line overflow-hidden rounded border bg-white"
                >
                  <Page
                    pageNumber={i + 1}
                    width={width ? Math.max(280, width - 24) : undefined}
                    scale={scale}
                    renderAnnotationLayer={false}
                    // The text layer is what makes the document selectable and
                    // searchable by the browser, which is worth keeping.
                    renderTextLayer
                    loading={
                      <div className="bg-line/30 h-[60vh] w-full animate-pulse" />
                    }
                  />
                </div>
              ))}
            </div>
          </Document>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-ink-subtle text-sm">
          {title}
          {pages ? ` — ${pages} page${pages === 1 ? "" : "s"}` : ""}
        </p>
        <RevisedToggle documentId={documentId} revised={revised} size="md" />
      </div>

      {/* Floating jump-to-top. Sized for a thumb, offset clear of the edge,
          and clipped from the layout until it is actually useful. */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`border-line bg-surface text-ink-subtle hover:text-ink hover:border-ink-subtle fixed right-5 bottom-5 z-30 flex size-12 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-all sm:right-8 sm:bottom-8 ${
          showTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <span aria-hidden className="text-lg leading-none">
          &uarr;
        </span>
      </button>
    </div>
  );
}
