/**
 * The document formats the library accepts, and how to tell them apart.
 *
 * Pure and dependency-free so client components can import it without dragging
 * a server module into the browser bundle.
 *
 * Legacy binary .doc and .ppt are deliberately absent. Nothing renders them in
 * a browser, so accepting them would only produce files that cannot be read.
 */

export type DocumentKind = "pdf" | "docx" | "pptx";

interface Format {
  kind: DocumentKind;
  mime: string;
  extension: string;
  /** Shown on the chip in listings. */
  label: string;
}

export const FORMATS: Format[] = [
  { kind: "pdf", mime: "application/pdf", extension: ".pdf", label: "PDF" },
  {
    kind: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: ".docx",
    label: "DOCX",
  },
  {
    kind: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extension: ".pptx",
    label: "PPTX",
  },
];

export const ACCEPTED_MIME_TYPES = FORMATS.map((f) => f.mime);
export const ACCEPTED_EXTENSIONS = FORMATS.map((f) => f.extension);

/** For an <input type="file"> accept attribute. */
export const ACCEPT_ATTRIBUTE = [
  ...ACCEPTED_MIME_TYPES,
  ...ACCEPTED_EXTENSIONS,
].join(",");

/**
 * Works out the format from the MIME type, falling back to the extension.
 *
 * The fallback matters: browsers report an empty or wrong type for Office
 * files often enough that trusting `File.type` alone rejects valid uploads.
 * Anything unrecognised is treated as a PDF, which is what every document
 * uploaded before this feature existed actually is.
 */
export function kindOf(mimeType?: string | null, fileName?: string | null): DocumentKind {
  if (mimeType) {
    const byMime = FORMATS.find((f) => f.mime === mimeType);
    if (byMime) return byMime.kind;
  }
  if (fileName) {
    const lower = fileName.toLowerCase();
    const byExt = FORMATS.find((f) => lower.endsWith(f.extension));
    if (byExt) return byExt.kind;
  }
  return "pdf";
}

export function labelOf(kind: DocumentKind): string {
  return FORMATS.find((f) => f.kind === kind)?.label ?? "FILE";
}

/** True when the file looks like something the library will accept. */
export function isAccepted(mimeType?: string | null, fileName?: string | null): boolean {
  if (mimeType && ACCEPTED_MIME_TYPES.includes(mimeType)) return true;
  if (fileName) {
    const lower = fileName.toLowerCase();
    return ACCEPTED_EXTENSIONS.some((e) => lower.endsWith(e));
  }
  return false;
}

/** Canonical MIME type for a file, so the browser's guess is never stored. */
export function mimeOf(fileName: string, reported?: string | null): string {
  const kind = kindOf(reported, fileName);
  return FORMATS.find((f) => f.kind === kind)!.mime;
}

/** Extension including the dot, derived from the name or the reported type. */
export function extensionOf(fileName: string, reported?: string | null): string {
  const kind = kindOf(reported, fileName);
  return FORMATS.find((f) => f.kind === kind)!.extension;
}
