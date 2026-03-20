import type { Database } from "@/types/database";

export type AppRole = Database["public"]["Enums"]["app_role"];
type ProfileRouteState = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role" | "onboarding_completed"
> | null;

export function getDashboardPathForRole(role: AppRole) {
  return role === "creator" ? "/dashboard/creator" : "/dashboard/campaign";
}

export function getOnboardingPathForRole(role: AppRole) {
  return role === "creator" ? "/creator/onboarding" : "/campaign/onboarding";
}

export function getSignedInDestination(profile: ProfileRouteState) {
  if (!profile?.role) {
    return "/signup?step=role";
  }

  if (!profile.onboarding_completed) {
    return getOnboardingPathForRole(profile.role);
  }

  return getDashboardPathForRole(profile.role);
}
