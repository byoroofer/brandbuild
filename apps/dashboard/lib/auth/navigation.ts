import type { Database } from "@/types/database";

export type AppRole = Database["public"]["Enums"]["app_role"];
type ProfileRouteState = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role" | "onboarding_completed"
> | null;

export function getDashboardPathForRole(role: AppRole) {
  return "/dashboard";
}

export function getOnboardingPathForRole(role: AppRole) {
  return "/dashboard";
}

export function getSignedInDestination(profile: ProfileRouteState) {
  return "/dashboard";
}
