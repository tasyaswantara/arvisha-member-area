import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return { url, publishableKey };
}

function createRedirectWithAuthState(
  request,
  pathname,
  refreshedCookies,
  refreshedHeaders
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";

  const redirectResponse = NextResponse.redirect(redirectUrl);

  refreshedCookies.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options);
  });

  Object.entries(refreshedHeaders).forEach(([name, value]) => {
    redirectResponse.headers.set(name, value);
  });

  return redirectResponse;
}

export async function updateSession(request) {
  const { url, publishableKey } = getSupabaseConfig();
  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/login";
  const isRegisterRoute = pathname === "/register";
  const isMemberRoute =
    pathname === "/member" || pathname.startsWith("/member/");
  const refreshedCookies = [];
  const refreshedHeaders = {};
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        refreshedCookies.push(...cookiesToSet);
        Object.assign(refreshedHeaders, headers);

        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          supabaseResponse.headers.set(name, value);
        });
      }
    }
  });

  const { data } = await supabase.auth.getClaims();
  const hasAuthenticatedClaims = Boolean(data?.claims);

  if (isMemberRoute && !hasAuthenticatedClaims) {
    return createRedirectWithAuthState(
      request,
      "/login",
      refreshedCookies,
      refreshedHeaders
    );
  }

  if ((isLoginRoute || isRegisterRoute) && hasAuthenticatedClaims) {
    return createRedirectWithAuthState(
      request,
      "/member/dashboard",
      refreshedCookies,
      refreshedHeaders
    );
  }

  return supabaseResponse;
}
