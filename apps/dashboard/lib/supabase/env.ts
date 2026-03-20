import { resolveAppUrl } from "@/lib/utils/app-url";

function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function hasSupabaseAdminEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseUrl() {
  return getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabasePublicKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return value;
}

export function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  return value;
}

export function getAppUrl() {
  return resolveAppUrl();
}
