import { PdfViewer } from "@/components/library/pdf-viewer";
import { DocxViewer } from "@/components/library/docx-viewer";
import { PptxViewer } from "@/components/library/pptx-viewer";
import { kindOf } from "@/lib/file-types";

/**
 * Picks a renderer for a document.
 *
 * A server component, so the two heavier viewers stay out of the bundle of any
 * page that does not need them. The format comes from the stored MIME type and
 * falls back to the object's extension, which is what makes rows written before
 * mimeType existed still resolve correctly.
 */
export function DocumentViewer({
  documentId,
  title,
  storagePath,
  mimeType,
  initialPageCount,
  revised,
}: {
  documentId: string;
  title: string;
  storagePath: string;
  mimeType: string | null;
  initialPageCount?: number | null;
  revised: boolean;
}) {
  const kind = kindOf(mimeType, storagePath);
  // Used only for the Content-Disposition name on a fallback download.
  const fileName = `${title}${storagePath.slice(storagePath.lastIndexOf("."))}`;

  if (kind === "docx") {
    return (
      <DocxViewer
        documentId={documentId}
        title={title}
        fileName={fileName}
        revised={revised}
      />
    );
  }

  if (kind === "pptx") {
    return (
      <PptxViewer
        documentId={documentId}
        title={title}
        fileName={fileName}
        revised={revised}
      />
    );
  }

  return (
    <PdfViewer
      documentId={documentId}
      title={title}
      fileName={fileName}
      initialPageCount={initialPageCount}
      revised={revised}
    />
  );
}
