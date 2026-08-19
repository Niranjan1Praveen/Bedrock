import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed Middleware to Proxy. The file must sit at the project
// root and export `proxy`.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Scoped deliberately.
 *
 * The public pages -- /, /blog, /projects, /tracks -- are cached, and this
 * proxy writes Set-Cookie when it refreshes a session. Running it there risks
 * a cached response carrying one visitor's session to the next. Nothing public
 * needs a session, so nothing public is matched.
 */
export const config = {
  matcher: ["/admin/:path*", "/login", "/api/posts/:path*", "/api/uploads", "/api/preview"],
};
