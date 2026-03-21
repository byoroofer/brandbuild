import { z } from "zod";

import { accountNotificationTopicMetadata } from "@/lib/account/constants";

const topicEnum = z.enum(
  accountNotificationTopicMetadata.map((item) => item.topic) as [string, ...string[]],
);
const frequencyEnum = z.enum(["instant", "daily_digest", "weekly_digest", "off"]);
const themeEnum = z.enum(["light", "dark", "system"]);

export const accountProfilePatchSchema = z.object({
  authEmail: z.string().email().max(320).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  contactEmail: z.string().email().max(320).optional().nullable(),
  contactPhone: z.string().max(32).optional().nullable(),
  contactWebsite: z.string().url().max(320).optional().nullable(),
  coverImagePath: z.string().max(512).optional().nullable(),
  displayName: z.string().min(1).max(80),
  headline: z.string().max(120).optional().nullable(),
  newPassword: z.string().min(12).max(128).optional().nullable(),
  username: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Use letters, numbers, and single hyphens only.")
    .max(64)
    .optional()
    .nullable(),
});

export const accountNotificationPreferenceSchema = z.object({
  emailEnabled: z.boolean(),
  frequency: frequencyEnum,
  inAppEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  quietHoursEnd: z.string().max(5).optional().nullable(),
  quietHoursStart: z.string().max(5).optional().nullable(),
  smsEnabled: z.boolean(),
  timezone: z.string().min(1).max(80),
  topic: topicEnum,
});

export const accountNotificationsPutSchema = z.object({
  preferences: z.array(accountNotificationPreferenceSchema),
});

export const accountPushSubscriptionSchema = z.object({
  browserName: z.string().max(80).optional().nullable(),
  deviceLabel: z.string().max(120).optional().nullable(),
  endpoint: z.string().url(),
  keys: z.object({
    auth: z.string().min(1),
    p256dh: z.string().min(1),
  }),
  permissionState: z.string().min(1).max(32),
  platformName: z.string().max(80).optional().nullable(),
});

export const accountPrivacyPatchSchema = z.object({
  isDiscoverable: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  marketingOptIn: z.boolean().optional(),
  noindex: z.boolean().optional(),
});

export const accountPreferencesPatchSchema = z.object({
  dashboardLayout: z.string().min(1).max(64),
  emailDigestFrequency: frequencyEnum,
  highContrast: z.boolean(),
  language: z.string().min(2).max(16),
  onboardingHintsEnabled: z.boolean(),
  reducedMotion: z.boolean(),
  subtitlesEnabled: z.boolean(),
  theme: themeEnum,
  timezone: z.string().min(1).max(80),
});

export const accountExportRequestSchema = z.object({
  note: z.string().max(240).optional().nullable(),
});

export const accountDeleteRequestSchema = z.object({
  confirmText: z.literal("DELETE"),
  exportFirst: z.boolean().default(true),
  note: z.string().max(240).optional().nullable(),
});

export const accountReauthSchema = z.object({
  password: z.string().min(8).max(128),
});
