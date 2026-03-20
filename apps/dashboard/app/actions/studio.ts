"use server";

import { revalidatePath } from "next/cache";

import { createStudioWriteClient } from "@/lib/db/client";
import { saveShotPromptDraft } from "@/lib/db/shots";
import {
  campaignCreateSchema,
  promptBuilderSchema,
} from "@/lib/studio/validation";
import type { Database } from "@/types/database";

export type StudioActionState = {
  error: string | null;
  success: string | null;
};

export const initialStudioActionState: StudioActionState = {
  error: null,
  success: null,
};

export async function createCampaignAction(
  _previousState: StudioActionState,
  formData: FormData,
): Promise<StudioActionState> {
  const parsed = campaignCreateSchema.safeParse({
    audience: formData.get("audience"),
    brandName: formData.get("brandName"),
    callToAction: formData.get("callToAction"),
    clientName: formData.get("clientName"),
    name: formData.get("name"),
    objective: formData.get("objective"),
    offer: formData.get("offer"),
    targetPlatforms: formData.getAll("targetPlatforms"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please complete the campaign fields.",
      success: null,
    };
  }

  try {
    const supabase = await createStudioWriteClient();

    if (!supabase) {
      throw new Error(
        "Supabase operator access is not configured yet, so campaign creation is disabled in this environment.",
      );
    }

    const payload: Database["public"]["Tables"]["campaigns"]["Insert"] = {
      audience: parsed.data.audience,
      brand_name: parsed.data.brandName,
      call_to_action: parsed.data.callToAction,
      client_name: parsed.data.clientName,
      name: parsed.data.name,
      objective: parsed.data.objective,
      offer: parsed.data.offer,
      status: "draft",
      target_platforms: parsed.data.targetPlatforms,
    };

    const { error } = await supabase.from("campaigns").insert(payload);

    if (error) {
      throw error;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/campaigns");

    return {
      error: null,
      success: "Campaign created.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create campaign.",
      success: null,
    };
  }
}

export async function saveShotPromptAction(
  _previousState: StudioActionState,
  formData: FormData,
): Promise<StudioActionState> {
  const parsed = promptBuilderSchema.safeParse({
    action: formData.get("action"),
    aspectRatio: formData.get("aspectRatio"),
    camera: formData.get("camera"),
    constraints: formData.get("constraints"),
    dialogueAudioIntent: formData.get("dialogueAudioIntent"),
    durationSeconds: formData.get("durationSeconds"),
    environment: formData.get("environment"),
    lighting: formData.get("lighting"),
    mood: formData.get("mood"),
    notes: formData.get("notes"),
    promptText: formData.get("promptText"),
    purpose: formData.get("purpose"),
    shotId: formData.get("shotId"),
    subject: formData.get("subject"),
    targetModel: formData.get("targetModel"),
    title: formData.get("title"),
    visualStyle: formData.get("visualStyle"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please complete the prompt builder fields.",
      success: null,
    };
  }

  try {
    await saveShotPromptDraft(parsed.data);

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/shots/${parsed.data.shotId}`);
    revalidatePath("/dashboard/shots");

    return {
      error: null,
      success: "Shot prompt saved.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save the shot prompt.",
      success: null,
    };
  }
}
