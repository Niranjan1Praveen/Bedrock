import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Server only.
 *
 * The secret key bypasses RLS and every storage policy, so this must never be
 * imported into a client component. It exists to mint signed URLs for the
 * private `library` bucket, which has no policies of its own precisely so that
 * nothing but this path can reach the objects.
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. Storage operations are unavailable.",
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const LIBRARY_BUCKET = "library";

/** How long a view link stays good for. Long enough to read, short enough that a copied URL dies. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;
