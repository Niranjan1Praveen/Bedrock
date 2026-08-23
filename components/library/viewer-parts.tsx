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
 * Offering the file here is a deliberate softening of the rule that nothing on
 * this site is downloadable: a file that will not render and cannot be saved is
 * simply lost. It appears only on failure, never as a normal affordance.
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
export function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShow(window.scrollY > 800);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
  children,
}: {
  status: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-line bg-surface-2 sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 rounded-t-xl border px-4 py-2.5">
      <span className="mono-label text-ink-subtle tabular-nums">{status}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
