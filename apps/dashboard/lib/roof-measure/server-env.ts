import { hasSupabaseAdminEnv } from "@/lib/supabase/env";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getGoogleGeocodingApiKey() {
  return requireEnv("GOOGLE_GEOCODING_API_KEY", process.env.GOOGLE_GEOCODING_API_KEY);
}

export function hasRoofMeasurePersistenceConfig() {
  return hasSupabaseAdminEnv();
}

export function isGuestModeEnabledOnServer() {
  return process.env.NEXT_PUBLIC_ENABLE_GUEST_MODE !== "false";
}
