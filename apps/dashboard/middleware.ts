import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/middleware";

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/dashboard");
}

function needsSessionRefresh(pathname: string) {
  return (
    isProtectedPath(pathname) ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth/")
  );
}

export async function middleware(request: NextRequest) {
  if (!hasSupabaseEnv() || !needsSessionRefresh(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
