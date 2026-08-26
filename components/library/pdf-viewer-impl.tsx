"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { RevisedToggle } from "@/components/library/revised-toggle";
import {
  RenderFallback,
  ScrollTopButton,
  useSignedUrl,
} from "@/components/library/viewer-parts";

// pdf.js parses in a worker. Resolving it through import.meta.url lets the
// bundler emit it as an asset rather than requiring a copy in /public that
// could drift out of step with the installed version.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * Assets pdf.js fetches over HTTP while rendering, copied into /public by
 * scripts/copy-pdfjs-assets.mjs.
 *
 * wasmUrl is the one that matters here. Without it pdf.js cannot initialise
 * OpenJPEG, so any JPEG 2000 image fails to decode -- and a scanned or
 * slide-exported page whose entire content is one such image comes out blank
 * white. That, not canvas memory, is why some documents showed nothing.
 *
 * Declared at module scope on purpose: react-pdf compares this object by
 * identity and reloads the document whenever it changes, so building it inline
 * would restart the load on every render.
 */
const PDF_OPTIONS = {
  wasmUrl: "/pdfjs/wasm/",
  cMapUrl: "/pdfjs/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "/pdfjs/standard_fonts/",
} as const;

/**
 * How many pages either side of the current one are actually drawn.
 *
 * This is the fix for pages rendering blank. Every page used to be mounted at
 * once, which for a 52-page set of notes meant 52 canvases plus 52 text layers,
 * and 331 for the largest file here. Browsers cap total canvas memory and
 * quietly paint anything past the budget white, so long documents came out
 * blank from some point onward. Five canvases at a time never approaches it.
 */
const WINDOW = 2;

/** Fallback page shape before the real aspect ratio is known: A4 portrait. */
const DEFAULT_ASPECT = 1.414;

export function PdfViewerImpl({
  documentId,
  title,
  fileName,
  initialPageCount,
  revised,
}: {
  documentId: string;
  title: string;
  fileName: string;
  initialPageCount?: number | null;
  revised: boolean;
}) {
  const { url, error, retry } = useSignedUrl(documentId);

  const [pages, setPages] = useState(initialPageCount ?? 0);
  // Bumped once per successful load, unconditionally -- see the effect below
  // for why `pages` alone cannot be trusted to signal this.
  const [loadTick, setLoadTick] = useState(0);
  const [current, setCurrent] = useState(1);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [aspect, setAspect] = useState(DEFAULT_ASPECT);
  const [failed, setFailed] = useState<string | null>(null);

  const frame = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ratios = useRef(new Map<number, number>());
  const reported = useRef(false);

  // Width the page is drawn at. Zoom multiplies it rather than being handed to
  // react-pdf separately: passing both `width` and `scale` makes it multiply
  // them, so 250% was quietly producing a canvas 6.25 times the area.
  const renderWidth = containerWidth
    ? Math.round(Math.max(280, containerWidth - 24) * scale)
    : 0;
  const placeholderHeight = renderWidth ? Math.round(renderWidth * aspect) : 600;

  /**
   * Measures the container before the first paint, then keeps it in step.
   *
   * The initial measurement is taken directly rather than waiting for a
   * ResizeObserver callback. Relying on that callback alone is a single point
   * of failure -- it was observed not firing at all for an already-laid-out
   * element, which left the viewer showing its skeleton forever -- and even
   * where it does fire it arrives after the first paint, so the width would go
   * from unknown to real and every page would start drawing, be cancelled and
   * restart. pdf.js leaves a half-painted canvas behind when that happens.
   *
   * useLayoutEffect rather than useEffect so the width is known before the
   * browser paints. Safe here because this component never renders on the
   * server.
   */
  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;

    const measure = () => {
      const cs = getComputedStyle(el);
      const padding =
        parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
      const next = Math.floor(el.clientWidth - padding);
      if (next > 0) setContainerWidth((prev) => (prev === next ? prev : next));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Belt and braces: a window resize covers the case where the observer
    // never delivers.
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /**
   * Tracks which page is in view.
   *
   * The ratio of every page is kept in a map rather than read from the entries
   * of one callback. An IntersectionObserver only reports entries whose
   * intersection *changed*, so scrolling one page out of view delivers a single
   * non-intersecting entry: the old code found nothing visible in that batch and
   * left the counter frozen, which is why Next and Prev then moved relative to a
   * stale page number.
   *
   * This reruns on `loadTick`, not on `pages` reaching a real value. react-pdf's
   * <Document> only mounts these page wrappers once its *own* internal `pdf`
   * state resolves, which lags behind `pages`: `pages` starts out already set
   * to the document's cached page count (`initialPageCount`), so for any file
   * that had been opened before, the real load finishing calls `setPages` with
   * that same number back, React sees no change and skips the re-render, and
   * this effect -- keyed on `pages` -- never reran to find the wrappers that
   * had since mounted. `loadTick` is bumped unconditionally on every load, so
   * it always forces a rerun once those wrappers actually exist.
   */
  useEffect(() => {
    if (!pages || !loadTick) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number((e.target as HTMLElement).dataset.page);
          if (n) ratios.current.set(n, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let bestPage = 0;
        let bestRatio = 0;
        for (const [n, r] of ratios.current) {
          if (r > bestRatio) {
            bestRatio = r;
            bestPage = n;
          }
        }
        if (bestPage) setCurrent(bestPage);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    const observed = pageRefs.current.filter(Boolean) as HTMLDivElement[];
    observed.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pages, loadTick]);

  const onDocumentLoad = useCallback(
    ({ numPages }: { numPages: number }) => {
      setPages(numPages);
      setFailed(null);
      setLoadTick((t) => t + 1);
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

  /** The first page to render tells us the real page shape. */
  const onPageLoad = useCallback(
    (page: { width: number; height: number }) => {
      if (page.width > 0) {
        const ratio = page.height / page.width;
        setAspect((prev) => (Math.abs(prev - ratio) > 0.01 ? ratio : prev));
      }
    },
    [],
  );

  const jump = (n: number) => {
    const target = Math.min(Math.max(1, n), pages || 1);
    pageRefs.current[target - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    // Move the counter immediately rather than waiting for the observer, so a
    // rapid series of Next clicks advances instead of fighting a stale value.
    setCurrent(target);
  };

  if (error) {
    return <RenderFallback message={error} fileName={fileName} signedUrl={url} onRetry={retry} />;
  }

  return (
    <div>
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
            onClick={() => jump(current - 1)}
            disabled={current <= 1}
            className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors disabled:opacity-30"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => jump(current + 1)}
            disabled={!pages || current >= pages}
            className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors disabled:opacity-30"
          >
            Next
          </button>
          <span className="bg-line mx-1.5 h-4 w-px" aria-hidden />
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, Math.round((s - 0.2) * 10) / 10))}
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
            onClick={() => setScale((s) => Math.min(2.5, Math.round((s + 0.2) * 10) / 10))}
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
        {/* Nothing is drawn until the container has been measured. The
            ResizeObserver only fires after the first paint, so rendering
            before it lands means every page starts drawing at an unknown
            width and is then cancelled and restarted at the real one --
            pdf.js leaves the half-painted canvas behind when that happens. */}
        {!url || !renderWidth ? (
          <div className="bg-line/40 h-[70vh] w-full animate-pulse rounded" />
        ) : failed ? (
          <RenderFallback message={failed} fileName={fileName} signedUrl={url} onRetry={retry} />
        ) : (
          <Document
            file={url}
            options={PDF_OPTIONS}
            onLoadSuccess={onDocumentLoad}
            onLoadError={() => setFailed("That file could not be read as a PDF.")}
            loading={<div className="bg-line/40 h-[70vh] w-full animate-pulse rounded" />}
            error={
              <RenderFallback
                message="That file could not be read as a PDF."
                fileName={fileName}
                signedUrl={url}
              />
            }
          >
            <div className="space-y-4">
              {Array.from({ length: pages }, (_, i) => {
                const n = i + 1;
                // Every page keeps a wrapper of roughly the right height, so
                // the scrollbar stays honest and jumping to an undrawn page
                // still lands in the right place. Only the window is drawn.
                const inWindow = Math.abs(n - current) <= WINDOW;

                return (
                  <div
                    key={n}
                    data-page={n}
                    ref={(el) => {
                      pageRefs.current[i] = el;
                    }}
                    className="border-line mx-auto overflow-hidden rounded border bg-white"
                    style={{
                      width: renderWidth,
                      minHeight: inWindow ? undefined : placeholderHeight,
                    }}
                  >
                    {inWindow ? (
                      <Page
                        pageNumber={n}
                        width={renderWidth}
                        onLoadSuccess={onPageLoad}
                        renderAnnotationLayer={false}
                        // Keeps the text selectable and findable with Ctrl+F.
                        // Affordable now that only a handful of pages exist.
                        renderTextLayer
                        onRenderError={(e) =>
                          console.error(`page ${n} failed to render`, e)
                        }
                        loading={
                          <div
                            className="bg-line/20 w-full animate-pulse"
                            style={{ height: placeholderHeight }}
                          />
                        }
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center"
                        style={{ height: placeholderHeight }}
                      >
                        <span className="mono-label text-ink-subtle/40 tabular-nums">
                          {n}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
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

      <ScrollTopButton />
    </div>
  );
}
