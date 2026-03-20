import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  hasSupabaseAdminEnv,
} from "@/lib/supabase/env";
import type { Database } from "@/types/database";

let adminClient: ReturnType<typeof createClient<Database>> | undefined;

export function isSupabaseAdminAvailable() {
  return hasSupabaseAdminEnv();
}

export function createAdminSupabaseClient() {
  if (!isSupabaseAdminAvailable()) {
    throw new Error("Supabase admin access is not configured.");
  }

  if (!adminClient) {
    adminClient = createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
