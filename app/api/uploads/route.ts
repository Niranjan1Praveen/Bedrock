import { createClient } from "@supabase/supabase-js";
import { unauthorized } from "@/lib/auth";
import { slugify } from "@/lib/markdown";

const BUCKET = "blog-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"];

/**
 * Uploads a cover image to Supabase Storage.
 *
 * Runs with the secret key, which stays on the server -- the browser only ever
 * sees the resulting public URL. Type and size are checked here rather than in
 * the editor, because a client-side check is a convenience, not a control.
 */
export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;

  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    return Response.json(
      { error: "SUPABASE_SECRET_KEY is not set, so uploads are disabled." },
      { status: 501 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file supplied" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return Response.json(
      { error: `Unsupported type ${file.type || "unknown"}` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `Too large: ${(file.size / 1024 / 1024).toFixed(1)}MB, limit is 5MB` },
      { status: 413 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret,
    { auth: { persistSession: false } },
  );

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `${Date.now()}-${base}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
