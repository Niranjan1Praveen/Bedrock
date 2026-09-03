import { revalidatePath } from "next/cache";
import { unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Marks one message read or unread, and deletes.
 *
 * Unlike POST /api/contact, these are for me only. The proxy does not cover
 * /api/contact -- it must not, or the public form would be redirected to the
 * login page -- so the session check here is the only one, and is not
 * optional.
 */
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { read } = (body ?? {}) as Record<string, unknown>;
  if (typeof read !== "boolean") {
    return Response.json({ error: "read must be a boolean" }, { status: 400 });
  }

  const { id } = await params;
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return Response.json({ ok: true, read });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return Response.json({ ok: true });
}
