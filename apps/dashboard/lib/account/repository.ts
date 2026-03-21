import { randomUUID } from "node:crypto";

import type { User } from "@supabase/supabase-js";

import { getAccountCapabilities } from "@/lib/account/capabilities";
import { accountNotificationTopicMetadata } from "@/lib/account/constants";
import {
  AccountApiError,
  type AccountRequestContext,
  resolvePrivateObjectUrl,
} from "@/lib/account/server";
import type {
  AccountDigestFrequency,
  AccountNotificationPreference,
  AccountNotificationTopic,
  AccountPasskey,
  AccountPreferences,
  AccountPrivacyRequest,
  AccountProfile,
  AccountPushSubscription,
  AccountSession,
  AccountSnapshot,
  AccountUserSummary,
} from "@/lib/account/types";
import { createAdminSupabaseClient, isSupabaseAdminAvailable } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SupabaseClientLike = Awaited<ReturnType<typeof createServerSupabaseClient>>;

type UserProfileRow = {
  avatar_path: string | null;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_website: string | null;
  cover_image_path: string | null;
  display_name: string | null;
  headline: string | null;
  is_discoverable: boolean | null;
  is_public: boolean | null;
  noindex: boolean | null;
  share_link_enabled: boolean | null;
  share_slug: string | null;
  share_token: string | null;
  username: string | null;
};

type UserPreferencesRow = {
  dashboard_layout: string | null;
  email_digest_frequency: AccountDigestFrequency | null;
  high_contrast: boolean | null;
  language: string | null;
  last_reauthenticated_at: string | null;
  onboarding_hints_enabled: boolean | null;
  reduced_motion: boolean | null;
  subtitles_enabled: boolean | null;
  theme: "light" | "dark" | "system" | null;
  timezone: string | null;
};

type UserNotificationRow = {
  email_enabled: boolean | null;
  frequency: AccountDigestFrequency | null;
  in_app_enabled: boolean | null;
  push_enabled: boolean | null;
  quiet_hours_end: string | null;
  quiet_hours_start: string | null;
  sms_enabled: boolean | null;
  timezone: string | null;
  topic: AccountNotificationTopic;
  transactional_locked: boolean | null;
};

type PushSubscriptionRow = {
  browser_name: string | null;
  created_at: string;
  device_label: string | null;
  endpoint: string;
  id: string;
  is_active: boolean | null;
  last_seen_at: string | null;
  permission_state: string | null;
  platform_name: string | null;
};

type UserSessionRow = {
  approximate_location: string | null;
  browser: string | null;
  created_at: string;
  id: string;
  last_active_at: string;
  os: string | null;
  revoked_at: string | null;
  session_label: string | null;
  session_token_hash: string;
  trusted: boolean | null;
};

type UserPasskeyRow = {
  backed_up: boolean | null;
  created_at: string;
  id: string;
  label: string | null;
  last_used_at: string | null;
  registration_status: string | null;
  transports: string[] | null;
};

type UserPrivacyRequestRow = {
  completed_at: string | null;
  created_at: string;
  id: string;
  request_type: "export" | "delete";
  requested_export_first: boolean | null;
  status: "pending" | "processing" | "completed" | "rejected" | "cancelled";
  status_detail: string | null;
};

function getTables(supabase: SupabaseClientLike) {
  return {
    auditEvents: supabase.from("audit_events" as never) as any,
    notificationPreferences: supabase.from("user_notification_preferences" as never) as any,
    passkeys: supabase.from("user_passkeys" as never) as any,
    preferences: supabase.from("user_preferences" as never) as any,
    privacyRequests: supabase.from("user_privacy_requests" as never) as any,
    profiles: supabase.from("profiles") as any,
    pushSubscriptions: supabase.from("push_subscriptions" as never) as any,
    userProfiles: supabase.from("user_profiles" as never) as any,
    userSessions: supabase.from("user_sessions" as never) as any,
  };
}

function getDefaultDisplayName(user: User) {
  const fullName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";

  if (fullName) {
    return fullName;
  }

  const localPart = user.email?.split("@")[0]?.trim();
  return localPart || "Operator";
}

function getDefaultProfile(user: User): AccountProfile {
  return {
    avatarPath: null,
    avatarUrl: null,
    bio: null,
    contactEmail: user.email ?? null,
    contactPhone: null,
    contactWebsite: null,
    coverImagePath: null,
    coverImageUrl: null,
    displayName: getDefaultDisplayName(user),
    headline: "AI video operator",
    isDiscoverable: false,
    isPublic: false,
    noindex: true,
    shareLinkEnabled: false,
    shareSlug: null,
    shareToken: null,
    username: null,
  };
}

function getDefaultPreferences(timezone: string): AccountPreferences {
  return {
    dashboardLayout: "cinematic-ops",
    emailDigestFrequency: "daily_digest",
    highContrast: false,
    language: "en",
    lastReauthenticatedAt: null,
    onboardingHintsEnabled: true,
    reducedMotion: false,
    subtitlesEnabled: true,
    theme: "system",
    timezone,
  };
}

function getDefaultNotificationPreference(
  topic: AccountNotificationTopic,
  timezone: string,
): AccountNotificationPreference {
  const metadata = accountNotificationTopicMetadata.find((item) => item.topic === topic);

  if (!metadata) {
    throw new Error(`Unknown notification topic: ${topic}`);
  }

  const transactional = metadata.transactional;

  return {
    description: metadata.description,
    emailEnabled: transactional || topic === "product",
    frequency: transactional ? "instant" : "daily_digest",
    inAppEnabled: true,
    label: metadata.label,
    pushEnabled: false,
    quietHoursEnd: null,
    quietHoursStart: null,
    smsEnabled: false,
    timezone,
    topic,
    transactional,
  };
}

async function ensureNotificationRows(
  supabase: SupabaseClientLike,
  userId: string,
  timezone: string,
) {
  const tables = getTables(supabase);
  const result = await tables.notificationPreferences.select("*").eq("user_id", userId);
  const rows = (result.data ?? []) as UserNotificationRow[];
  const existingTopics = new Set(rows.map((row) => row.topic));
  const missingRows = accountNotificationTopicMetadata
    .filter((item) => !existingTopics.has(item.topic))
    .map((item) => {
      const defaults = getDefaultNotificationPreference(item.topic, timezone);

      return {
        email_enabled: defaults.emailEnabled,
        frequency: defaults.frequency,
        in_app_enabled: defaults.inAppEnabled,
        push_enabled: defaults.pushEnabled,
        quiet_hours_end: defaults.quietHoursEnd,
        quiet_hours_start: defaults.quietHoursStart,
        sms_enabled: defaults.smsEnabled,
        timezone: defaults.timezone,
        topic: defaults.topic,
        transactional_locked: defaults.transactional,
        user_id: userId,
      };
    });

  if (missingRows.length === 0) {
    return;
  }

  const insertResult = await tables.notificationPreferences.insert(missingRows);

  if (insertResult.error) {
    throw new AccountApiError("We couldn't initialize your notification settings.", 500);
  }
}

export async function logAccountAuditEvent(
  context: Pick<
    AccountRequestContext,
    "approximateLocation" | "browser" | "ipAddress" | "supabase" | "user" | "userAgent"
  >,
  eventType: string,
  metadata: Record<string, unknown> = {},
) {
  const tables = getTables(context.supabase);

  await tables.auditEvents.insert({
    entity_id: context.user.id,
    entity_type: "account",
    event_type: eventType,
    ip_address: context.ipAddress,
    metadata: {
      approximateLocation: context.approximateLocation,
      browser: context.browser,
      ...metadata,
      userAgent: context.userAgent,
    },
    user_id: context.user.id,
  });
}

export async function enforceAuditRateLimit(
  context: Pick<AccountRequestContext, "supabase" | "user">,
  eventType: string,
  maxAttempts: number,
  windowMinutes: number,
) {
  const tables = getTables(context.supabase);
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const result = await tables.auditEvents
    .select("id", { count: "exact", head: true })
    .eq("user_id", context.user.id)
    .eq("event_type", eventType)
    .gte("created_at", since);

  if ((result.count ?? 0) >= maxAttempts) {
    throw new AccountApiError(
      "Too many attempts right now. Please wait a few minutes and try again.",
      429,
    );
  }
}

export async function syncCurrentUserSession(context: AccountRequestContext) {
  if (!context.currentSessionHash) {
    return;
  }

  const tables = getTables(context.supabase);
  const sessionLabel =
    [context.browser, context.os].filter(Boolean).join(" on ") || "Current device";
  const upsertResult = await tables.userSessions.upsert(
    {
      approximate_location: context.approximateLocation,
      browser: context.browser,
      last_active_at: new Date().toISOString(),
      os: context.os,
      revoked_at: null,
      session_label: sessionLabel,
      session_token_hash: context.currentSessionHash,
      trusted: true,
      user_id: context.user.id,
    },
    { onConflict: "user_id,session_token_hash" },
  );

  if (upsertResult.error) {
    throw new AccountApiError("We couldn't update your session record.", 500);
  }
}

export async function isCurrentSessionRevoked(context: AccountRequestContext) {
  if (!context.currentSessionHash) {
    return false;
  }

  const tables = getTables(context.supabase);
  const result = await tables.userSessions
    .select("revoked_at")
    .eq("user_id", context.user.id)
    .eq("session_token_hash", context.currentSessionHash)
    .maybeSingle();

  if (result.error || !result.data) {
    return false;
  }

  return Boolean(result.data.revoked_at);
}

export async function ensureAccountRecords(context: AccountRequestContext) {
  const tables = getTables(context.supabase);
  const defaultProfile = getDefaultProfile(context.user);
  const defaultPreferences = getDefaultPreferences("UTC");

  const profileUpsert = await tables.userProfiles.upsert(
    {
      contact_email: defaultProfile.contactEmail,
      display_name: defaultProfile.displayName,
      headline: defaultProfile.headline,
      is_discoverable: defaultProfile.isDiscoverable,
      is_public: defaultProfile.isPublic,
      noindex: defaultProfile.noindex,
      share_link_enabled: defaultProfile.shareLinkEnabled,
      user_id: context.user.id,
    },
    { onConflict: "user_id" },
  );

  if (profileUpsert.error) {
    throw new AccountApiError("We couldn't initialize your profile.", 500);
  }

  const preferencesUpsert = await tables.preferences.upsert(
    {
      dashboard_layout: defaultPreferences.dashboardLayout,
      email_digest_frequency: defaultPreferences.emailDigestFrequency,
      high_contrast: defaultPreferences.highContrast,
      language: defaultPreferences.language,
      onboarding_hints_enabled: defaultPreferences.onboardingHintsEnabled,
      reduced_motion: defaultPreferences.reducedMotion,
      subtitles_enabled: defaultPreferences.subtitlesEnabled,
      theme: defaultPreferences.theme,
      timezone: defaultPreferences.timezone,
      user_id: context.user.id,
    },
    { onConflict: "user_id" },
  );

  if (preferencesUpsert.error) {
    throw new AccountApiError("We couldn't initialize your preferences.", 500);
  }

  await ensureNotificationRows(context.supabase, context.user.id, defaultPreferences.timezone);
  await syncCurrentUserSession(context);
}

async function getUserSummary(context: AccountRequestContext): Promise<AccountUserSummary> {
  const tables = getTables(context.supabase);
  const profileResult = await tables.profiles
    .select("full_name")
    .eq("id", context.user.id)
    .maybeSingle();

  return {
    createdAt: context.user.created_at,
    displayName:
      profileResult.data?.full_name ??
      (typeof context.user.user_metadata?.full_name === "string"
        ? context.user.user_metadata.full_name
        : null) ??
      getDefaultDisplayName(context.user),
    email: context.user.email ?? null,
    id: context.user.id,
    lastSignInAt: context.user.last_sign_in_at ?? null,
  };
}

function mergeProfileRow(
  row: UserProfileRow | null,
  avatarUrl: string | null,
  coverUrl: string | null,
  fallbackEmail: string | null,
): AccountProfile {
  return {
    avatarPath: row?.avatar_path ?? null,
    avatarUrl,
    bio: row?.bio ?? null,
    contactEmail: row?.contact_email ?? fallbackEmail,
    contactPhone: row?.contact_phone ?? null,
    contactWebsite: row?.contact_website ?? null,
    coverImagePath: row?.cover_image_path ?? null,
    coverImageUrl: coverUrl,
    displayName: row?.display_name ?? "Operator",
    headline: row?.headline ?? "AI video operator",
    isDiscoverable: row?.is_discoverable ?? false,
    isPublic: row?.is_public ?? false,
    noindex: row?.noindex ?? true,
    shareLinkEnabled: row?.share_link_enabled ?? false,
    shareSlug: row?.share_slug ?? null,
    shareToken: row?.share_token ?? null,
    username: row?.username ?? null,
  };
}

function mergePreferencesRow(row: UserPreferencesRow | null): AccountPreferences {
  const fallback = getDefaultPreferences("UTC");

  return {
    dashboardLayout: row?.dashboard_layout ?? fallback.dashboardLayout,
    emailDigestFrequency: row?.email_digest_frequency ?? fallback.emailDigestFrequency,
    highContrast: row?.high_contrast ?? fallback.highContrast,
    language: row?.language ?? fallback.language,
    lastReauthenticatedAt: row?.last_reauthenticated_at ?? fallback.lastReauthenticatedAt,
    onboardingHintsEnabled:
      row?.onboarding_hints_enabled ?? fallback.onboardingHintsEnabled,
    reducedMotion: row?.reduced_motion ?? fallback.reducedMotion,
    subtitlesEnabled: row?.subtitles_enabled ?? fallback.subtitlesEnabled,
    theme: row?.theme ?? fallback.theme,
    timezone: row?.timezone ?? fallback.timezone,
  };
}

function mergeNotificationRow(
  row: UserNotificationRow | null,
  topic: AccountNotificationTopic,
  timezone: string,
): AccountNotificationPreference {
  const fallback = getDefaultNotificationPreference(topic, timezone);

  return {
    description: fallback.description,
    emailEnabled: row?.email_enabled ?? fallback.emailEnabled,
    frequency: row?.frequency ?? fallback.frequency,
    inAppEnabled: row?.in_app_enabled ?? fallback.inAppEnabled,
    label: fallback.label,
    pushEnabled: row?.push_enabled ?? fallback.pushEnabled,
    quietHoursEnd: row?.quiet_hours_end ?? fallback.quietHoursEnd,
    quietHoursStart: row?.quiet_hours_start ?? fallback.quietHoursStart,
    smsEnabled: row?.sms_enabled ?? fallback.smsEnabled,
    timezone: row?.timezone ?? fallback.timezone,
    topic,
    transactional: row?.transactional_locked ?? fallback.transactional,
  };
}

function toPushSubscription(row: PushSubscriptionRow): AccountPushSubscription {
  return {
    browserName: row.browser_name,
    createdAt: row.created_at,
    deviceLabel: row.device_label,
    endpointPreview:
      row.endpoint.length > 42 ? `${row.endpoint.slice(0, 42)}...` : row.endpoint,
    id: row.id,
    isActive: row.is_active ?? true,
    lastSeenAt: row.last_seen_at,
    permissionState: row.permission_state ?? "default",
    platformName: row.platform_name,
  };
}

function toSession(row: UserSessionRow, currentSessionHash: string | null): AccountSession {
  return {
    approximateLocation: row.approximate_location,
    browser: row.browser,
    createdAt: row.created_at,
    current: currentSessionHash === row.session_token_hash,
    id: row.id,
    lastActiveAt: row.last_active_at,
    os: row.os,
    revokedAt: row.revoked_at,
    sessionLabel: row.session_label,
    trusted: row.trusted ?? false,
  };
}

function toPasskey(row: UserPasskeyRow): AccountPasskey {
  return {
    backedUp: row.backed_up ?? false,
    createdAt: row.created_at,
    id: row.id,
    label: row.label ?? "Passkey",
    lastUsedAt: row.last_used_at,
    registrationStatus: row.registration_status ?? "pending",
    transports: row.transports ?? [],
  };
}

function toPrivacyRequest(row: UserPrivacyRequestRow): AccountPrivacyRequest {
  return {
    completedAt: row.completed_at,
    createdAt: row.created_at,
    id: row.id,
    requestType: row.request_type,
    requestedExportFirst: row.requested_export_first ?? false,
    status: row.status,
    statusDetail: row.status_detail,
  };
}

export async function getAccountSnapshot(context: AccountRequestContext): Promise<AccountSnapshot> {
  await ensureAccountRecords(context);
  const tables = getTables(context.supabase);
  const [
    userSummary,
    profileResult,
    preferencesResult,
    notificationsResult,
    pushResult,
    sessionsResult,
    passkeysResult,
    privacyResult,
  ] = await Promise.all([
    getUserSummary(context),
    tables.userProfiles.select("*").eq("user_id", context.user.id).maybeSingle(),
    tables.preferences.select("*").eq("user_id", context.user.id).maybeSingle(),
    tables.notificationPreferences.select("*").eq("user_id", context.user.id),
    tables.pushSubscriptions
      .select("*")
      .eq("user_id", context.user.id)
      .order("created_at", { ascending: false }),
    tables.userSessions
      .select("*")
      .eq("user_id", context.user.id)
      .order("last_active_at", { ascending: false }),
    tables.passkeys
      .select("*")
      .eq("user_id", context.user.id)
      .order("created_at", { ascending: false }),
    tables.privacyRequests
      .select("*")
      .eq("user_id", context.user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profileRow = (profileResult.data ?? null) as UserProfileRow | null;
  const preferences = mergePreferencesRow(
    (preferencesResult.data ?? null) as UserPreferencesRow | null,
  );
  const notificationRows = (notificationsResult.data ?? []) as UserNotificationRow[];
  const notificationMap = new Map(notificationRows.map((row) => [row.topic, row]));
  const [avatarUrl, coverUrl] = await Promise.all([
    resolvePrivateObjectUrl(profileRow?.avatar_path ?? null),
    resolvePrivateObjectUrl(profileRow?.cover_image_path ?? null),
  ]);

  return {
    capabilities: getAccountCapabilities(),
    notifications: accountNotificationTopicMetadata.map((item) =>
      mergeNotificationRow(
        notificationMap.get(item.topic) ?? null,
        item.topic,
        preferences.timezone,
      ),
    ),
    passkeys: ((passkeysResult.data ?? []) as UserPasskeyRow[]).map(toPasskey),
    preferences,
    privacyRequests: ((privacyResult.data ?? []) as UserPrivacyRequestRow[]).map(
      toPrivacyRequest,
    ),
    profile: mergeProfileRow(profileRow, avatarUrl, coverUrl, context.user.email ?? null),
    pushSubscriptions: ((pushResult.data ?? []) as PushSubscriptionRow[]).map(
      toPushSubscription,
    ),
    sessions: ((sessionsResult.data ?? []) as UserSessionRow[]).map((row) =>
      toSession(row, context.currentSessionHash),
    ),
    user: userSummary,
  };
}

export async function updateAccountProfile(
  context: AccountRequestContext,
  input: {
    authEmail?: string | null;
    bio?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    contactWebsite?: string | null;
    coverImagePath?: string | null;
    displayName: string;
    headline?: string | null;
    newPassword?: string | null;
    username?: string | null;
  },
) {
  if (input.authEmail || input.newPassword) {
    const authAttributes: Record<string, string> = {};

    if (input.authEmail) {
      authAttributes.email = input.authEmail;
    }

    if (input.newPassword) {
      authAttributes.password = input.newPassword;
    }

    const authUpdate = await context.supabase.auth.updateUser(authAttributes);

    if (authUpdate.error) {
      throw new AccountApiError(authUpdate.error.message, 400);
    }
  }

  const tables = getTables(context.supabase);
  const profilePatch: Record<string, unknown> = {
    display_name: input.displayName,
  };

  if (typeof input.bio !== "undefined") {
    profilePatch.bio = input.bio ?? null;
  }

  if (typeof input.contactEmail !== "undefined") {
    profilePatch.contact_email = input.contactEmail ?? null;
  }

  if (typeof input.contactPhone !== "undefined") {
    profilePatch.contact_phone = input.contactPhone ?? null;
  }

  if (typeof input.contactWebsite !== "undefined") {
    profilePatch.contact_website = input.contactWebsite ?? null;
  }

  if (typeof input.coverImagePath !== "undefined") {
    profilePatch.cover_image_path = input.coverImagePath ?? null;
  }

  if (typeof input.headline !== "undefined") {
    profilePatch.headline = input.headline ?? null;
  }

  if (typeof input.username !== "undefined") {
    profilePatch.username = input.username ?? null;
  }

  const profileUpdate = await tables.userProfiles
    .update(profilePatch)
    .eq("user_id", context.user.id)
    .select("*")
    .single();

  if (profileUpdate.error) {
    if (profileUpdate.error.code === "23505") {
      throw new AccountApiError("That username is already taken.", 409);
    }

    throw new AccountApiError("We couldn't update your profile.", 500);
  }

  await logAccountAuditEvent(context, "account_profile_updated", {
    authEmailChanged: Boolean(input.authEmail),
    passwordChanged: Boolean(input.newPassword),
  });

  return profileUpdate.data as UserProfileRow;
}

export async function updateAccountPreferences(
  context: AccountRequestContext,
  input: AccountPreferences,
) {
  const tables = getTables(context.supabase);
  const result = await tables.preferences
    .update({
      dashboard_layout: input.dashboardLayout,
      email_digest_frequency: input.emailDigestFrequency,
      high_contrast: input.highContrast,
      language: input.language,
      onboarding_hints_enabled: input.onboardingHintsEnabled,
      reduced_motion: input.reducedMotion,
      subtitles_enabled: input.subtitlesEnabled,
      theme: input.theme,
      timezone: input.timezone,
    })
    .eq("user_id", context.user.id)
    .select("*")
    .single();

  if (result.error) {
    throw new AccountApiError("We couldn't update your preferences.", 500);
  }

  await logAccountAuditEvent(context, "account_preferences_updated", {
    theme: input.theme,
    timezone: input.timezone,
  });

  return result.data as UserPreferencesRow;
}

export async function updateNotificationPreferences(
  context: AccountRequestContext,
  input: AccountNotificationPreference[],
) {
  const capabilities = getAccountCapabilities();
  const tables = getTables(context.supabase);
  const rows = input.map((preference) => ({
    email_enabled: preference.topic === "security" ? true : preference.emailEnabled,
    frequency: preference.topic === "security" ? "instant" : preference.frequency,
    in_app_enabled: true,
    push_enabled: capabilities.hasPushNotifications ? preference.pushEnabled : false,
    quiet_hours_end: preference.quietHoursEnd ?? null,
    quiet_hours_start: preference.quietHoursStart ?? null,
    sms_enabled: capabilities.hasSmsNotifications ? preference.smsEnabled : false,
    timezone: preference.timezone,
    topic: preference.topic,
    transactional_locked: preference.transactional,
    user_id: context.user.id,
  }));

  const result = await tables.notificationPreferences.upsert(rows, {
    onConflict: "user_id,topic",
  });

  if (result.error) {
    throw new AccountApiError("We couldn't update your notification settings.", 500);
  }

  await logAccountAuditEvent(context, "account_notifications_updated", {
    topics: input.map((item) => item.topic),
  });
}

export async function createOrUpdatePushSubscription(
  context: AccountRequestContext,
  input: {
    browserName?: string | null;
    deviceLabel?: string | null;
    endpoint: string;
    keys: { auth: string; p256dh: string };
    permissionState: string;
    platformName?: string | null;
  },
) {
  const tables = getTables(context.supabase);
  const result = await tables.pushSubscriptions.upsert(
    {
      browser_name: input.browserName ?? context.browser,
      device_label: input.deviceLabel ?? "This device",
      endpoint: input.endpoint,
      is_active: true,
      last_seen_at: new Date().toISOString(),
      permission_state: input.permissionState,
      platform_name: input.platformName ?? context.os,
      subscription_json: input,
      user_id: context.user.id,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (result.error) {
    throw new AccountApiError("We couldn't save this device subscription.", 500);
  }

  await logAccountAuditEvent(context, "account_push_subscription_created", {
    endpoint: input.endpoint,
  });
}

export async function deletePushSubscription(context: AccountRequestContext, id: string) {
  const tables = getTables(context.supabase);
  const result = await tables.pushSubscriptions
    .update({ is_active: false })
    .eq("user_id", context.user.id)
    .eq("id", id);

  if (result.error) {
    throw new AccountApiError("We couldn't disable that device subscription.", 500);
  }

  await logAccountAuditEvent(context, "account_push_subscription_removed", {
    subscriptionId: id,
  });
}

export async function updatePrivacyControls(
  context: AccountRequestContext,
  input: {
    isDiscoverable?: boolean;
    isPublic?: boolean;
    marketingOptIn?: boolean;
    noindex?: boolean;
  },
) {
  const tables = getTables(context.supabase);
  const profilePatch: Record<string, unknown> = {};

  if (typeof input.isDiscoverable === "boolean") {
    profilePatch.is_discoverable = input.isDiscoverable;
  }

  if (typeof input.isPublic === "boolean") {
    profilePatch.is_public = input.isPublic;
  }

  if (typeof input.noindex === "boolean") {
    profilePatch.noindex = input.noindex;
  }

  if (Object.keys(profilePatch).length > 0) {
    const profileResult = await tables.userProfiles
      .update(profilePatch)
      .eq("user_id", context.user.id);

    if (profileResult.error) {
      throw new AccountApiError("We couldn't update your privacy preferences.", 500);
    }
  }

  if (typeof input.marketingOptIn === "boolean") {
    const marketingPreference = getDefaultNotificationPreference("marketing", "UTC");
    const notificationsResult = await tables.notificationPreferences.upsert(
      {
        email_enabled: input.marketingOptIn,
        frequency: input.marketingOptIn ? marketingPreference.frequency : "off",
        in_app_enabled: input.marketingOptIn,
        push_enabled: false,
        sms_enabled: false,
        timezone: marketingPreference.timezone,
        topic: "marketing",
        transactional_locked: false,
        user_id: context.user.id,
      },
      { onConflict: "user_id,topic" },
    );

    if (notificationsResult.error) {
      throw new AccountApiError("We couldn't update your marketing preference.", 500);
    }
  }

  await logAccountAuditEvent(context, "account_privacy_updated", input);
}

export async function rotateShareLink(context: AccountRequestContext) {
  const capabilities = getAccountCapabilities();

  if (!capabilities.hasPublicProfiles) {
    throw new AccountApiError("Public profile sharing is disabled for this deployment.", 403);
  }

  const tables = getTables(context.supabase);
  const shareToken = randomUUID();
  const result = await tables.userProfiles
    .update({
      share_link_enabled: true,
      share_token: shareToken,
    })
    .eq("user_id", context.user.id)
    .select("share_slug, share_token")
    .single();

  if (result.error) {
    throw new AccountApiError("We couldn't create a share link.", 500);
  }

  await logAccountAuditEvent(context, "account_share_link_rotated");
  return result.data as Pick<UserProfileRow, "share_slug" | "share_token">;
}

export async function createPrivacyRequest(
  context: AccountRequestContext,
  input: {
    requestType: "export" | "delete";
    requestedExportFirst?: boolean;
    statusDetail?: string | null;
  },
) {
  const tables = getTables(context.supabase);
  const result = await tables.privacyRequests
    .insert({
      request_type: input.requestType,
      requested_export_first: input.requestedExportFirst ?? false,
      status: "pending",
      status_detail: input.statusDetail ?? null,
      user_id: context.user.id,
    })
    .select("*")
    .single();

  if (result.error) {
    throw new AccountApiError("We couldn't create that request.", 500);
  }

  await logAccountAuditEvent(context, `account_${input.requestType}_requested`, {
    requestedExportFirst: input.requestedExportFirst ?? false,
  });

  return result.data as UserPrivacyRequestRow;
}

export async function getLatestDeleteRequest(context: AccountRequestContext) {
  const tables = getTables(context.supabase);
  const result = await tables.privacyRequests
    .select("*")
    .eq("user_id", context.user.id)
    .eq("request_type", "delete")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) {
    throw new AccountApiError("We couldn't load your deletion status.", 500);
  }

  return (result.data ?? null) as UserPrivacyRequestRow | null;
}

export async function markRecentReauthentication(context: AccountRequestContext) {
  const tables = getTables(context.supabase);
  const timestamp = new Date().toISOString();
  const result = await tables.preferences
    .update({ last_reauthenticated_at: timestamp })
    .eq("user_id", context.user.id);

  if (result.error) {
    throw new AccountApiError(
      "We couldn't record your verification timestamp.",
      500,
    );
  }

  await logAccountAuditEvent(context, "account_reauthenticated");
  return timestamp;
}

export async function listPasskeysForUser(context: AccountRequestContext) {
  const tables = getTables(context.supabase);
  const result = await tables.passkeys
    .select("*")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new AccountApiError("We couldn't load your passkeys.", 500);
  }

  return ((result.data ?? []) as UserPasskeyRow[]).map(toPasskey);
}

export async function deletePasskey(context: AccountRequestContext, id: string) {
  const tables = getTables(context.supabase);
  const result = await tables.passkeys
    .delete()
    .eq("user_id", context.user.id)
    .eq("id", id);

  if (result.error) {
    throw new AccountApiError("We couldn't remove that passkey.", 500);
  }

  await logAccountAuditEvent(context, "account_passkey_deleted", {
    passkeyId: id,
  });
}

export async function listSessionsForUser(context: AccountRequestContext) {
  const tables = getTables(context.supabase);
  const result = await tables.userSessions
    .select("*")
    .eq("user_id", context.user.id)
    .order("last_active_at", { ascending: false });

  if (result.error) {
    throw new AccountApiError("We couldn't load your active sessions.", 500);
  }

  return ((result.data ?? []) as UserSessionRow[]).map((row) =>
    toSession(row, context.currentSessionHash),
  );
}

export async function revokeSession(context: AccountRequestContext, id: string) {
  const tables = getTables(context.supabase);
  const sessionResult = await tables.userSessions
    .select("*")
    .eq("user_id", context.user.id)
    .eq("id", id)
    .maybeSingle();

  if (sessionResult.error || !sessionResult.data) {
    throw new AccountApiError("We couldn't find that session.", 404);
  }

  const session = sessionResult.data as UserSessionRow;
  const updateResult = await tables.userSessions
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", context.user.id)
    .eq("id", id);

  if (updateResult.error) {
    throw new AccountApiError("We couldn't revoke that session.", 500);
  }

  if (context.currentSessionHash && session.session_token_hash === context.currentSessionHash) {
    await context.supabase.auth.signOut({ scope: "local" });
  }

  await logAccountAuditEvent(context, "account_session_revoked", {
    sessionId: id,
  });
}

export async function logoutCurrentUser(context: AccountRequestContext) {
  const tables = getTables(context.supabase);

  if (context.currentSessionHash) {
    await tables.userSessions
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", context.user.id)
      .eq("session_token_hash", context.currentSessionHash);
  }

  const result = await context.supabase.auth.signOut({ scope: "local" });

  if (result.error) {
    throw new AccountApiError("We couldn't sign you out.", 500);
  }

  await logAccountAuditEvent(context, "account_logged_out_current");
}

export async function logoutAllUserSessions(context: AccountRequestContext) {
  const tables = getTables(context.supabase);
  const revokeResult = await tables.userSessions
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", context.user.id);

  if (revokeResult.error) {
    throw new AccountApiError("We couldn't revoke your session records.", 500);
  }

  if (context.accessToken && isSupabaseAdminAvailable()) {
    const admin = createAdminSupabaseClient();
    const result = await admin.auth.admin.signOut(context.accessToken, "global");

    if (result.error) {
      throw new AccountApiError("We couldn't invalidate your active sessions.", 500);
    }
  } else {
    const result = await context.supabase.auth.signOut({ scope: "global" });

    if (result.error) {
      throw new AccountApiError("We couldn't invalidate your active sessions.", 500);
    }
  }

  await logAccountAuditEvent(context, "account_logged_out_all");
}

export async function storeAvatarPath(context: AccountRequestContext, path: string | null) {
  const tables = getTables(context.supabase);
  const result = await tables.userProfiles
    .update({ avatar_path: path })
    .eq("user_id", context.user.id)
    .select("avatar_path")
    .single();

  if (result.error) {
    throw new AccountApiError("We couldn't update your avatar.", 500);
  }

  return result.data?.avatar_path as string | null;
}

export async function deleteStoredObject(path: string | null) {
  if (!path || !isSupabaseAdminAvailable()) {
    return;
  }

  const bucketName = process.env.STORAGE_BUCKET_ASSETS || "assets";
  await createAdminSupabaseClient().storage.from(bucketName).remove([path]);
}

export async function uploadPrivateAccountObject(path: string, file: File) {
  if (!isSupabaseAdminAvailable()) {
    throw new AccountApiError(
      "Private object storage is not configured on this deployment.",
      503,
    );
  }

  const bucketName = process.env.STORAGE_BUCKET_ASSETS || "assets";
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const result = await createAdminSupabaseClient().storage.from(bucketName).upload(path, fileBuffer, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });

  if (result.error) {
    throw new AccountApiError("We couldn't upload that file.", 500);
  }
}
