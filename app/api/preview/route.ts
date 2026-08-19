import { unauthorized } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

/**
 * Renders the editor's preview through the same pipeline that renders a
 * published post, so what you see while writing is what ships.
 *
 * Behind auth: it is an arbitrary-input renderer and there is no reason for it
 * to be reachable by anyone else.
 */
export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { markdown } = (body ?? {}) as { markdown?: unknown };
  if (typeof markdown !== "string") {
    return Response.json({ error: "markdown must be a string" }, { status: 400 });
  }

  return Response.json({ html: await renderMarkdown(markdown) });
}
