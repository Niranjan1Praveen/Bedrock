import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * The authorization boundary.
 *
 * getClaims() verifies the JWT signature against the project's published keys.
 * getSession() does not and can be spoofed by a forged cookie, so it must never
 * be used to protect anything on the server.
 */
/**
 * Wrapped in React's cache so the JWT is verified once per request.
 *
 * Every admin navigation checks the session at least twice -- the layout
 * guards the section and the page guards itself -- and each check was a
 * separate signature verification against the published keys. Deduping is
 * per-request, so it never returns a stale session across requests.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  return data.claims;
});

/** Throws if signed out. For route handlers, prefer requireUserOr401. */
export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/** Returns a 401 Response when signed out, otherwise null. */
export async function unauthorized(): Promise<Response | null> {
  const user = await getUser();
  if (user) return null;
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
