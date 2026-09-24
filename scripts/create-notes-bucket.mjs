/**
 * Creates the private `notes` bucket that holds images pasted into notes.
 *
 *   node --env-file=.env scripts/create-notes-bucket.mjs
 *
 * Safe to run again: it updates the limits if the bucket already exists. The
 * bucket is private and carries no storage policies, so nothing but the
 * service-role client -- which mints short-lived signed URLs after checking
 * whose note an image belongs to -- can reach an object.
 */
import { createClient } from "@supabase/supabase-js";

const BUCKET = "notes";
const options = {
  public: false,
  fileSizeLimit: 8 * 1024 * 1024,
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data: existing } = await supabase.storage.getBucket(BUCKET);
const { error } = existing
  ? await supabase.storage.updateBucket(BUCKET, options)
  : await supabase.storage.createBucket(BUCKET, options);

if (error) {
  console.error(`Could not ${existing ? "update" : "create"} "${BUCKET}":`, error.message);
  process.exit(1);
}
console.log(`${existing ? "Updated" : "Created"} private bucket "${BUCKET}".`);
