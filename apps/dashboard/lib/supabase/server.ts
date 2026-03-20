import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabasePublicKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            options: CookieOptions;
            value: string;
          }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies directly in some render modes.
          }
        },
      },
    },
  );
}
