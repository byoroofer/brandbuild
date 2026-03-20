"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createBrowserSupabaseClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      getSupabaseUrl(),
      getSupabasePublicKey(),
    );
  }

  return browserClient;
}
