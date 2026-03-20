import { z } from "zod";

const requiredText = (label: string, min = 2, max = 120) =>
  z
    .string({
      required_error: `${label} is required.`,
      invalid_type_error: `${label} is required.`,
    })
    .trim()
    .min(min, `${label} is required.`)
    .max(max, `${label} is too long.`);

export const roleSchema = z.enum(["creator", "campaign"], {
  errorMap: () => ({
    message: "Choose whether you are joining as a creator or a campaign.",
  }),
});

export const creatorOnboardingSchema = z.object({
  audienceSize: requiredText("Audience size", 1, 80),
  bio: z
    .string({
      required_error: "Add a short bio so campaigns know how to place you.",
      invalid_type_error: "Add a short bio so campaigns know how to place you.",
    })
    .trim()
    .min(30, "Add a short bio so campaigns know how to place you.")
    .max(420, "Keep your bio under 420 characters."),
  contentFocus: requiredText("Content focus"),
  displayName: requiredText("Display name"),
  homeBase: requiredText("Home base", 2, 80),
  primaryPlatform: requiredText("Primary platform"),
});

export const campaignOnboardingSchema = z.object({
  campaignName: requiredText("Campaign or initiative name"),
  creatorBudget: requiredText("Creator budget range", 2, 80),
  creatorGoal: z
    .string({
      required_error: "Tell us what you want creators to help accomplish.",
      invalid_type_error: "Tell us what you want creators to help accomplish.",
    })
    .trim()
    .min(24, "Tell us what you want creators to help accomplish.")
    .max(420, "Keep the creator goal under 420 characters."),
  geographyFocus: requiredText("Geography focus", 2, 120),
  launchTimeline: requiredText("Launch timeline", 2, 80),
  organizationName: requiredText("Organization name"),
  organizationType: requiredText("Organization type", 2, 80),
  websiteUrl: z.string().trim().max(240, "Website URL is too long.").optional(),
});
