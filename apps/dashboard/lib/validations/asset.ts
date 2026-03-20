import { z } from "zod";

export const assetSchema = z.object({
  campaignId: z.string().min(1),
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  type: z.enum([
    "reference_image",
    "reference_video",
    "generated_video",
    "thumbnail",
    "logo",
    "product_image",
    "character_sheet",
    "moodboard",
    "audio_track",
    "subtitle_file",
    "edit_export",
  ]),
});
