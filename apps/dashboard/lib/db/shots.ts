import type { Database } from "@/types/database";

import { createStudioWriteClient } from "@/lib/db/client";
import { getShotDetail, listShots } from "@/lib/studio/repository";

export type SaveShotPromptDraftInput = {
  action: string;
  aspectRatio: string;
  camera: string;
  constraints: string;
  dialogueAudioIntent: string;
  durationSeconds: number;
  environment: string;
  lighting: string;
  mood: string;
  notes: string;
  promptText: string;
  purpose: string;
  shotId: string;
  subject: string;
  targetModel: Database["public"]["Enums"]["target_model"];
  title: string;
  visualStyle: string;
};

export async function saveShotPromptDraft(input: SaveShotPromptDraftInput) {
  const supabase = await createStudioWriteClient();

  if (!supabase) {
    throw new Error(
      "Supabase operator access is not configured yet, so shot updates are unavailable in this environment.",
    );
  }

  const payload: Database["public"]["Tables"]["shots"]["Update"] = {
    aspect_ratio: input.aspectRatio,
    camera_direction: input.camera,
    constraints: input.constraints,
    dialogue_audio_intent: input.dialogueAudioIntent,
    duration_seconds: input.durationSeconds,
    environment: input.environment,
    internal_notes: input.notes,
    lighting: input.lighting,
    mood: input.mood,
    prompt_text: input.promptText,
    purpose: input.purpose,
    status: "prompt_ready",
    target_model: input.targetModel,
    title: input.title,
    visual_style: input.visualStyle,
  };

  const { data, error } = await supabase
    .from("shots")
    .update(payload)
    .eq("id", input.shotId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export { getShotDetail, listShots };
