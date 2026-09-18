"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Pieces shared by the PDF, Word and slide viewers.
 *
 * Each viewer fetches its own signed link rather than receiving one as a prop,
 * so the link is never baked into the page HTML and cannot be lifted from a
 * cached document.
 */

export function useSignedUrl(documentId: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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
  }, [documentId, attempt]);

  // Clearing the error belongs here rather than at the top of the effect:
  // a synchronous setState in an effect body cascades a render, and this is
  // an event handler, which is exactly where a write like this should live.
  const retry = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);
  return { url, error, retry };
}

/**
 * Turns a signed link into one that downloads rather than displays.
 *
 * The `download` attribute is ignored across origins, so it cannot be relied on
 * here. Supabase Storage honours a `download` query parameter by setting
 * Content-Disposition, which works regardless of origin.
 */
export function downloadUrl(signedUrl: string, fileName: string) {
  const sep = signedUrl.includes("?") ? "&" : "?";
  return `${signedUrl}${sep}download=${encodeURIComponent(fileName)}`;
}

/**
 * Shown when a document cannot be rendered in the page.
 *
 * A file offered here has nowhere else to go if this fails too -- there is no
 * separate download affordance to fall back on inside a broken viewer -- so
 * the raw file stays on offer even though nothing rendered.
 */
export function RenderFallback({
  message,
  signedUrl,
  fileName,
  onRetry,
}: {
  message: string;
  signedUrl?: string | null;
  fileName: string;
  onRetry?: () => void;
}) {
  return (
    <div className="border-line rounded-xl border border-dashed px-6 py-16 text-center">
      <p className="text-ink-muted mx-auto max-w-md text-sm leading-relaxed">
        {message}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded border px-3 py-2 transition-colors"
          >
            Try again
          </button>
        )}
        {signedUrl && (
          <a
            href={downloadUrl(signedUrl, fileName)}
            className="mono-label border-line text-ink-subtle hover:border-ink-subtle hover:text-ink rounded border px-3 py-2 transition-colors"
          >
            Download instead
          </a>
        )}
      </div>
    </div>
  );
}

/** Floating jump-to-top, appearing once there is enough scrolled past. */
export function ScrollTopButton({
  scrollTarget,
}: {
  /**
   * What "top" means, and what to watch to decide whether to show at all.
   * Defaults to the window. Pass the fullscreen shell once a viewer owns its
   * own scrolling region, so this keeps reflecting the real scroll position
   * instead of watching a window that has stopped moving.
   */
  scrollTarget?: HTMLElement | null;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = scrollTarget ?? window;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollTarget ? scrollTarget.scrollTop : window.scrollY;
        setShow(y > 800);
        ticking = false;
      });
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener("scroll", onScroll);
  }, [scrollTarget]);

  return (
    <button
      type="button"
      onClick={() => (scrollTarget ?? window).scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`border-line bg-surface text-ink-subtle hover:text-ink hover:border-ink-subtle fixed right-5 bottom-5 z-30 flex size-12 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-all sm:right-8 sm:bottom-8 ${
        show
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span aria-hidden className="text-lg leading-none">
        &uarr;
      </span>
    </button>
  );
}

/** The toolbar strip above every viewer, so the three look alike. */
export function ViewerToolbar({
  status,
  scrollTarget,
  children,
}: {
  status: string;
  /** Passed once a viewer is fullscreen -- see ScrollTopButton and
      useFullscreenViewer. Its presence is also what decides the sticky
      offset: top-0 once this owns the whole viewport, top-14 to clear the
      site header the rest of the time. */
  scrollTarget?: HTMLElement | null;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`border-line bg-surface-2 sticky z-20 flex flex-wrap items-center justify-between gap-3 rounded-t-xl border px-4 py-2.5 ${
        scrollTarget ? "top-0" : "top-14"
      }`}
    >
      <span className="mono-label text-ink-subtle tabular-nums">{status}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => (scrollTarget ?? window).scrollTo({ top: 0, behavior: "smooth" })}
          className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors"
        >
          Top
        </button>
        {children && (
          <>
            <span className="bg-line mx-1.5 h-4 w-px" aria-hidden />
            {children}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Puts a viewer into a full-viewport overlay, in place.
 *
 * Not the Fullscreen API: `element.requestFullscreen()` needs a user gesture,
 * is inconsistent for arbitrary elements on iOS Safari, and hides browser
 * chrome the reader may still want (the address bar, a back gesture). This is
 * a fixed-position overlay instead -- the same trick as any full-screen media
 * viewer -- which works identically everywhere and needs no permission.
 *
 * Body scroll is locked for as long as this is open: a `position: fixed`
 * overlay does not, on its own, stop the page behind it from scrolling too.
 */
export function useFullscreenViewer() {
  const [fullscreen, setFullscreen] = useState(false);
  // State, not a plain ref: ViewerToolbar and ScrollTopButton need this
  // element while rendering, to decide what "top" scrolls, and a ref read
  // during render is exactly what React warns against -- it can read a value
  // that is already stale by the time the render commits. A callback ref
  // written into state is the sanctioned way to have the DOM node available
  // for render rather than only inside an effect or an event handler.
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!fullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

  return { fullscreen, setFullscreen, shellEl, setShellEl };
}

/**
 * The shell every viewer renders into, fullscreen or not.
 *
 * Always the same element -- only its class changes -- rather than switching
 * which tree is mounted for the two states. react-pdf's page wrappers keep the
 * IntersectionObserver refs they were built with, docx-preview and
 * pptx-preview keep their already-rendered DOM, so expanding mid-page lands
 * exactly where the reader was instead of restarting the render.
 */
export function ViewerFrame({
  setShellEl,
  fullscreen,
  children,
}: {
  /** The `setShellEl` returned by useFullscreenViewer, used directly as the
      callback ref. */
  setShellEl: (el: HTMLDivElement | null) => void;
  fullscreen: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={setShellEl}
      className={
        fullscreen
          ? "bg-base fixed inset-0 z-40 overflow-y-auto px-4 py-4 sm:px-8"
          : ""
      }
    >
      {children}
    </div>
  );
}

/** Toggles ViewerFrame between in-page and fullscreen. */
export function ExpandToggle({
  fullscreen,
  onToggle,
}: {
  fullscreen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={fullscreen}
      className="mono-label text-ink-subtle hover:bg-surface hover:text-ink rounded px-2.5 py-1.5 transition-colors"
    >
      {fullscreen ? "Close" : "Expand"}
    </button>
  );
}
