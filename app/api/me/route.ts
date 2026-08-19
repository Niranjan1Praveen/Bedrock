import { getUser } from "@/lib/auth";

/**
 * Whether the current visitor is signed in. Nothing else.
 *
 * Used by the header menu to decide whether to offer the admin links. It is
 * cosmetic only -- every protected route and mutation checks the session for
 * itself, so lying to this endpoint gains an attacker a link, not access.
 *
 * Deliberately outside the proxy matcher: this is called from public pages, and
 * the proxy writes Set-Cookie. Reading the session without refreshing it keeps
 * that header off responses that public pages trigger.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();
  return Response.json(
    { signedIn: Boolean(user) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
