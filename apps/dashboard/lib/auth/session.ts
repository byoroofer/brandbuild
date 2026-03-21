import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import {
  getSessionIdFromAccessToken,
  hashSessionIdentifier,
} from "@/lib/account/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getOptionalUser(): Promise<User | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const sessionId = getSessionIdFromAccessToken(session?.access_token ?? null);

    if (sessionId) {
      try {
        const userSessionsTable = supabase.from("user_sessions" as never) as any;
        const sessionResult = await userSessionsTable
          .select("revoked_at")
          .eq("user_id", user.id)
          .eq("session_token_hash", hashSessionIdentifier(sessionId))
          .maybeSingle();

        if (sessionResult.data?.revoked_at) {
          await supabase.auth.signOut({ scope: "local" });
          return null;
        }
      } catch {
        // Account session tracking may not be migrated yet on every environment.
      }
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireUser(redirectPath = "/login"): Promise<User> {
  const user = await getOptionalUser();

  if (!user) {
    redirect(redirectPath);
  }

  return user;
}
