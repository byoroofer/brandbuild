import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

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
