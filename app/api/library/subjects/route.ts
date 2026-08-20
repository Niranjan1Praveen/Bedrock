import { unauthorized } from "@/lib/auth";
import { getLibraryTree } from "@/lib/library";

/** Existing subjects and topics, for the upload form's suggestions. */
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await unauthorized();
  if (denied) return denied;
  return Response.json(
    { subjects: await getLibraryTree() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
