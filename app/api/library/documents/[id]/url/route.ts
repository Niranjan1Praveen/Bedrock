import { unauthorized } from "@/lib/auth";
import { getDocument, signedReadUrl } from "@/lib/library";

/**
 * Hands back a short-lived link to one PDF.
 *
 * This is the only route to the bytes: the bucket is private and carries no
 * storage policies, so the publishable key cannot fetch an object even if
 * somebody knows its path. The link expires in about an hour, which means a
 * URL lifted from devtools is worthless shortly afterwards.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  try {
    const url = await signedReadUrl(doc.storagePath);
    return Response.json(
      { url, title: doc.title, pageCount: doc.pageCount },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Could not sign that file" },
      { status: 500 },
    );
  }
}
