import { revalidatePath } from "next/cache";
import { unauthorized } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { setSubjectImage } from "@/lib/library";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/markdown";

const BUCKET = "subject-covers";
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/avif"];
/**
 * Deliberately under the bucket's own 4MB ceiling, because this route receives
 * the file rather than handing out an upload ticket: a serverless request body
 * is capped near 4.5MB. Covers are small, so it is not worth the ticket dance
 * the PDFs need.
 */
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { slug } = await params;
  const subject = await prisma.subject.findUnique({ where: { slug } });
  if (!subject) return Response.json({ error: "Not found" }, { status: 404 });

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
      { error: `That is ${(file.size / 1048576).toFixed(1)}MB; the limit is 4MB` },
      { status: 413 },
    );
  }

  const supabase = createAdminClient();
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  const path = `${slugify(slug)}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  await setSubjectImage(slug, data.publicUrl);

  revalidatePath("/admin/library");
  revalidatePath(`/admin/library/${slug}`);
  return Response.json({ url: data.publicUrl });
}

/** Clears the cover, falling back to the generated one. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { slug } = await params;
  const subject = await prisma.subject.findUnique({ where: { slug } });
  if (!subject) return Response.json({ error: "Not found" }, { status: 404 });

  await setSubjectImage(slug, null);
  revalidatePath("/admin/library");
  revalidatePath(`/admin/library/${slug}`);
  return Response.json({ ok: true });
}
