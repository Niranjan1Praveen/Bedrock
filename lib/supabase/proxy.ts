import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the auth session and bounces signed-out visitors to /login.
 *
 * This runs only on the paths listed in proxy.ts. It must never run on a
 * publicly cacheable route: a refreshed session is written back as Set-Cookie,
 * and if such a response were cached by the CDN the next visitor would be
 * served somebody else's session.
 *
 * Treat the redirect here as an optimistic check only. Next's own guidance is
 * that a proxy is not an authorization boundary, so every protected route
 * calls requireUser() for itself.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          // Cache-control headers that stop a CDN storing the refreshed session.
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Nothing may run between createServerClient and getClaims: the call is what
  // refreshes the token, and delaying it causes random sign-outs.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";
  // API routes answer 401 themselves; redirecting them would turn a clean
  // status code into an HTML login page.
  const isApi = pathname.startsWith("/api/");

  if (!user && !isLogin && !isApi) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
