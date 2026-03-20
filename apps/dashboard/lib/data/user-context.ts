import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type CreatorProfileRow = Database["public"]["Tables"]["creator_profiles"]["Row"];
export type CampaignProfileRow = Database["public"]["Tables"]["campaign_profiles"]["Row"];

export type UserContext = {
  campaignProfile: CampaignProfileRow | null;
  creatorProfile: CreatorProfileRow | null;
  organization: OrganizationRow | null;
  profile: ProfileRow | null;
  user: User;
};

export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createServerSupabaseClient();
  const profilesTable = supabase.from("profiles") as any;
  const creatorProfilesTable = supabase.from("creator_profiles") as any;
  const organizationsTable = supabase.from("organizations") as any;
  const campaignProfilesTable = supabase.from("campaign_profiles") as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profileResult = await profilesTable.select("*").eq("id", user.id).maybeSingle();
  const profile = profileResult.data as ProfileRow | null;

  let creatorProfile: CreatorProfileRow | null = null;
  let organization: OrganizationRow | null = null;
  let campaignProfile: CampaignProfileRow | null = null;

  if (profile?.role === "creator") {
    const result = await creatorProfilesTable.select("*").eq("user_id", user.id).maybeSingle();

    creatorProfile = result.data as CreatorProfileRow | null;
  }

  if (profile?.role === "campaign") {
    const [organizationResult, campaignResult] = await Promise.all([
      organizationsTable.select("*").eq("owner_user_id", user.id).maybeSingle(),
      campaignProfilesTable.select("*").eq("owner_user_id", user.id).maybeSingle(),
    ]);

    organization = organizationResult.data as OrganizationRow | null;
    campaignProfile = campaignResult.data as CampaignProfileRow | null;
  }

  return {
    campaignProfile,
    creatorProfile,
    organization,
    profile,
    user,
  };
}

export async function requireUserContext() {
  const context = await getUserContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}
