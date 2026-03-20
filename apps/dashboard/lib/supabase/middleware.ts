import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import { NextResponse as MiddlewareResponse } from "next/server";

import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}>;
export async function updateSession(
  request: NextRequest,
  requestHeaders: Headers,
): Promise<{
  response: NextResponse;
  user: User | null;
}>;
export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  const effectiveHeaders = requestHeaders ?? new Headers(request.headers);
  let response = MiddlewareResponse.next({
    request: {
      headers: effectiveHeaders,
    },
  });

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabasePublicKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            options: CookieOptions;
            value: string;
          }>,
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = MiddlewareResponse.next({
            request: {
              headers: effectiveHeaders,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
