import { z } from "zod";

export const tagDiscoveryPlatforms = [
  "instagram",
  "tiktok",
  "youtube-shorts",
  "meta-ads",
  "linkedin",
] as const;

export const tagDiscoveryAudioMimeTypes = [
  "audio/m4a",
  "audio/mp3",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
] as const;

export const tagDiscoveryAudioExtensions = [
  ".m4a",
  ".mp3",
  ".mp4",
  ".mpeg",
  ".ogg",
  ".wav",
  ".webm",
] as const;

export const maxTagDiscoveryAudioBytes = 8 * 1024 * 1024;
export const maxTagDiscoveryQueryCharacters = 800;

export const campaignCreateSchema = z.object({
  audience: z.string().min(1, "Audience is required."),
  brandName: z.string().min(1, "Brand name is required."),
  callToAction: z.string().min(1, "Call to action is required."),
  clientName: z.string().min(1, "Client name is required."),
  name: z.string().min(1, "Campaign name is required."),
  objective: z.string().min(1, "Objective is required."),
  offer: z.string().min(1, "Offer is required."),
  targetPlatforms: z.array(z.string()).min(1, "Select at least one target platform."),
});

export const promptBuilderSchema = z.object({
  action: z.string().min(1, "Action is required."),
  aspectRatio: z.string().min(1, "Aspect ratio is required."),
  camera: z.string().min(1, "Camera direction is required."),
  constraints: z.string().min(1, "Constraints are required."),
  dialogueAudioIntent: z.string().min(1, "Dialogue or audio intent is required."),
  durationSeconds: z.coerce
    .number()
    .int("Duration must be a whole number.")
    .min(1, "Duration must be at least 1 second.")
    .max(60, "Duration must be 60 seconds or less."),
  environment: z.string().min(1, "Environment is required."),
  lighting: z.string().min(1, "Lighting is required."),
  mood: z.string().min(1, "Mood is required."),
  notes: z.string().min(1, "Generation notes are required."),
  promptText: z.string().min(1, "Prompt text is required."),
  purpose: z.string().min(1, "Purpose is required."),
  shotId: z.string().min(1, "Shot id is required."),
  subject: z.string().min(1, "Subject is required."),
  targetModel: z.enum(["sora", "kling", "higgsfield"]),
  title: z.string().min(1, "Shot title is required."),
  visualStyle: z.string().min(1, "Visual style is required."),
});

export const studioAgentRequestSchema = z.object({
  query: z
    .string()
    .min(1, "Ask the studio agent a concrete question.")
    .max(1200, "Keep studio agent requests under 1200 characters."),
});

export const tagDiscoveryRequestSchema = z.object({
  platforms: z
    .array(z.enum(tagDiscoveryPlatforms))
    .min(1, "Choose at least one target platform.")
    .max(5, "Choose no more than five target platforms."),
  query: z
    .string()
    .max(
      maxTagDiscoveryQueryCharacters,
      `Keep the search brief under ${maxTagDiscoveryQueryCharacters} characters.`,
    )
    .transform((value) => value.trim()),
});
