"use client";

import dynamic from "next/dynamic";

/**
 * Loads the PDF reader in the browser only.
 *
 * pdf.js touches DOMMatrix, Path2D and canvas at module scope, none of which
 * exist in Node. A "use client" component is still server-rendered for the
 * initial HTML, so importing react-pdf directly threw "DOMMatrix is not
 * defined" during SSR on every load. React recovered by discarding the errored
 * subtree and re-rendering on the client -- and a Page unmounted while pdf.js
 * was drawing leaves a cancelled render task behind a blank canvas, which is
 * what produced white pages.
 *
 * ssr:false keeps the module out of the server render entirely. It has to be
 * declared from a client component, which is the only reason this wrapper
 * exists.
 */
const PdfViewerImpl = dynamic(
  () => import("./pdf-viewer-impl").then((m) => m.PdfViewerImpl),
  {
    ssr: false,
    loading: () => (
      <div>
        <div className="border-line bg-surface-2 flex h-11 items-center rounded-t-xl border px-4">
          <span className="mono-label text-ink-subtle">Loading</span>
        </div>
        <div className="border-line bg-surface rounded-b-xl border border-t-0 p-3 sm:p-5">
          <div className="bg-line/40 h-[70vh] w-full animate-pulse rounded" />
        </div>
      </div>
    ),
  },
);

export function PdfViewer(props: {
  documentId: string;
  title: string;
  fileName: string;
  initialPageCount?: number | null;
  revised: boolean;
}) {
  return <PdfViewerImpl {...props} />;
}
