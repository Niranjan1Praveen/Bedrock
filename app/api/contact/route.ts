import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * The contact form's endpoint.
 *
 * The only unauthenticated write on the site, so it is deliberately narrow:
 * two fields, both length-capped, a honeypot, and a per-sender hourly cap.
 * It is not in proxy.ts's matcher and must not be -- the whole point is that
 * a signed-out visitor can post to it.
 */
export const dynamic = "force-dynamic";

const MAX_EMAIL = 200;
const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 10;
/** Messages allowed from one sender per hour. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

/** Deliberately loose: the only real test of an address is replying to it. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A stable, non-reversible key for one sender.
 *
 * Only ever used to count recent submissions. Salting it means the stored
 * value cannot be checked against a guessed address -- the whole IPv4 space
 * is small enough to hash exhaustively otherwise. The salt is optional so
 * this works undeployed; setting CONTACT_IP_SALT is what makes it meaningful.
 */
function hashIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  if (!ip) return null;
  return createHash("sha256")
    .update(`${process.env.CONTACT_IP_SALT ?? ""}:${ip}`)
    .digest("hex");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, message, website } = (body ?? {}) as Record<string, unknown>;

  // The honeypot. It is hidden from people and has no label, so anything in
  // it came from something filling every field it found. Answered with the
  // same 200 a real submission gets: a bot told it failed just tries again.
  if (typeof website === "string" && website.trim() !== "") {
    return Response.json({ ok: true });
  }

  if (typeof email !== "string" || !EMAIL.test(email) || email.length > MAX_EMAIL) {
    return Response.json(
      { error: "Enter an email address I can reply to." },
      { status: 400 },
    );
  }

  if (typeof message !== "string" || message.trim().length < MIN_MESSAGE) {
    return Response.json(
      { error: `Tell me a little more -- at least ${MIN_MESSAGE} characters.` },
      { status: 400 },
    );
  }

  if (message.length > MAX_MESSAGE) {
    return Response.json(
      { error: `Keep it under ${MAX_MESSAGE} characters.` },
      { status: 400 },
    );
  }

  const ipHash = hashIp(request);

  if (ipHash) {
    const recent = await prisma.contactMessage.count({
      where: { ipHash, createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) } },
    });
    if (recent >= RATE_LIMIT) {
      return Response.json(
        { error: "That is a few too many messages in an hour. Try later." },
        { status: 429 },
      );
    }
  }

  await prisma.contactMessage.create({
    data: { email: email.trim(), message: message.trim(), ipHash },
  });

  return Response.json({ ok: true });
}
