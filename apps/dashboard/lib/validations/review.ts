import { z } from "zod";

export const reviewSchema = z.object({
  assetId: z.string().min(1),
  decision: z.enum(["pending", "selected", "rejected", "hold"]),
  notes: z.string().min(1),
  scoreBrandFit: z.number().int().min(1).max(10),
  scoreEditability: z.number().int().min(1).max(10),
  scoreHookStrength: z.number().int().min(1).max(10),
  scoreMotionQuality: z.number().int().min(1).max(10),
  scorePromptFidelity: z.number().int().min(1).max(10),
  scoreRealism: z.number().int().min(1).max(10),
  shotId: z.string().min(1),
});
