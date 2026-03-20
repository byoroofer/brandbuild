"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getDashboardPathForRole, getOnboardingPathForRole } from "@/lib/auth/navigation";
import { requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/forms/action-state";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeOptionalString, normalizeOptionalUrl } from "@/lib/utils";
import {
  campaignOnboardingSchema,
  creatorOnboardingSchema,
  roleSchema,
} from "@/lib/validations/onboarding";
import type { Database } from "@/types/database";

function getIssueMessage(stateMessage: string, fallbackMessage: string) {
  return stateMessage || fallbackMessage;
}

function getMetadataFullName(user: User) {
  const rawValue =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;

  return normalizeOptionalString(rawValue);
}

export async function selectRoleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsedRole = roleSchema.safeParse(formData.get("role"));

  if (!parsedRole.success) {
    return {
      error: getIssueMessage(
        parsedRole.error.issues[0]?.message ?? "",
        "Choose whether you are joining as a creator or a campaign.",
      ),
    };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const profilesTable = supabase.from("profiles") as any;
  const fullName = getMetadataFullName(user);

  const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: user.id,
    onboarding_completed: false,
    role: parsedRole.data,
    ...(fullName ? { full_name: fullName } : {}),
  };

  const { error } = await profilesTable.upsert(profilePayload, {
    onConflict: "id",
  });

  if (error) {
    return {
      error: "We couldn't save your role yet. Please try again.",
    };
  }

  revalidatePath("/signup");
  revalidatePath("/dashboard");
  redirect(getOnboardingPathForRole(parsedRole.data));
}

export async function saveCreatorOnboardingAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = creatorOnboardingSchema.safeParse({
    audienceSize: formData.get("audienceSize"),
    bio: formData.get("bio"),
    contentFocus: formData.get("contentFocus"),
    displayName: formData.get("displayName"),
    homeBase: formData.get("homeBase"),
    primaryPlatform: formData.get("primaryPlatform"),
  });

  if (!parsed.success) {
    return {
      error: getIssueMessage(
        parsed.error.issues[0]?.message ?? "",
        "Please complete the creator profile fields.",
      ),
    };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const profilesTable = supabase.from("profiles") as any;
  const creatorProfilesTable = supabase.from("creator_profiles") as any;
  const fullName = getMetadataFullName(user);

  const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: user.id,
    onboarding_completed: true,
    role: "creator",
    ...(fullName ? { full_name: fullName } : {}),
  };

  const { error: profileError } = await profilesTable.upsert(profilePayload, {
    onConflict: "id",
  });

  if (profileError) {
    return {
      error: "We couldn't update your account yet. Please try again.",
    };
  }

  const creatorProfilePayload: Database["public"]["Tables"]["creator_profiles"]["Insert"] = {
    audience_size: parsed.data.audienceSize,
    bio: parsed.data.bio,
    content_focus: parsed.data.contentFocus,
    display_name: parsed.data.displayName,
    home_base: parsed.data.homeBase,
    primary_platform: parsed.data.primaryPlatform,
    user_id: user.id,
  };

  const { error: creatorProfileError } = await creatorProfilesTable.upsert(
    creatorProfilePayload,
    {
      onConflict: "user_id",
    },
  );

  if (creatorProfileError) {
    return {
      error: "We couldn't save your creator profile yet. Please try again.",
    };
  }

  revalidatePath("/creator/onboarding");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/creator");
  redirect(getDashboardPathForRole("creator"));
}

export async function saveCampaignOnboardingAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = campaignOnboardingSchema.safeParse({
    campaignName: formData.get("campaignName"),
    creatorBudget: formData.get("creatorBudget"),
    creatorGoal: formData.get("creatorGoal"),
    geographyFocus: formData.get("geographyFocus"),
    launchTimeline: formData.get("launchTimeline"),
    organizationName: formData.get("organizationName"),
    organizationType: formData.get("organizationType"),
    websiteUrl: formData.get("websiteUrl"),
  });

  if (!parsed.success) {
    return {
      error: getIssueMessage(
        parsed.error.issues[0]?.message ?? "",
        "Please complete the campaign setup fields.",
      ),
    };
  }

  const websiteInput = normalizeOptionalString(parsed.data.websiteUrl);
  const normalizedWebsite = normalizeOptionalUrl(parsed.data.websiteUrl);

  if (websiteInput && !normalizedWebsite) {
    return {
      error: "Enter a valid website URL or leave that field blank.",
    };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const profilesTable = supabase.from("profiles") as any;
  const organizationsTable = supabase.from("organizations") as any;
  const campaignProfilesTable = supabase.from("campaign_profiles") as any;
  const fullName = getMetadataFullName(user);

  const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: user.id,
    onboarding_completed: true,
    role: "campaign",
    ...(fullName ? { full_name: fullName } : {}),
  };

  const { error: profileError } = await profilesTable.upsert(profilePayload, {
    onConflict: "id",
  });

  if (profileError) {
    return {
      error: "We couldn't update your campaign account yet. Please try again.",
    };
  }

  const organizationPayload: Database["public"]["Tables"]["organizations"]["Insert"] = {
    name: parsed.data.organizationName,
    organization_type: parsed.data.organizationType,
    owner_user_id: user.id,
    website_url: normalizedWebsite,
  };

  const organizationResult = await organizationsTable.upsert(organizationPayload, {
      onConflict: "owner_user_id",
    })
    .select("*")
    .single();
  const organization = organizationResult.data as
    | Database["public"]["Tables"]["organizations"]["Row"]
    | null;
  const organizationError = organizationResult.error;

  if (organizationError || !organization) {
    return {
      error: "We couldn't save your organization details yet. Please try again.",
    };
  }

  const campaignProfilePayload: Database["public"]["Tables"]["campaign_profiles"]["Insert"] = {
    campaign_name: parsed.data.campaignName,
    creator_budget: parsed.data.creatorBudget,
    creator_goal: parsed.data.creatorGoal,
    geography_focus: parsed.data.geographyFocus,
    launch_timeline: parsed.data.launchTimeline,
    organization_id: organization.id,
    owner_user_id: user.id,
  };

  const { error: campaignProfileError } = await campaignProfilesTable.upsert(
    campaignProfilePayload,
    {
      onConflict: "owner_user_id",
    },
  );

  if (campaignProfileError) {
    return {
      error: "We couldn't save your campaign profile yet. Please try again.",
    };
  }

  revalidatePath("/campaign/onboarding");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/campaign");
  redirect(getDashboardPathForRole("campaign"));
}
