import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

let adminClient: ReturnType<typeof createClient<any>> | undefined;

export function createRoofMeasureAdminClient() {
  if (!adminClient) {
    adminClient = createClient<any>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
