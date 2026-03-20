import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type StudioSupabaseClient = ReturnType<typeof createAdminSupabaseClient>;

async function createAuthenticatedStudioClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = (await createServerSupabaseClient()) as unknown as StudioSupabaseClient;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return supabase;
}

export async function createStudioReadClient() {
  return createAuthenticatedStudioClient();
}

export async function createStudioWriteClient() {
  return createAuthenticatedStudioClient();
}

export function hasStudioPersistenceEnv() {
  return hasSupabaseEnv();
}
