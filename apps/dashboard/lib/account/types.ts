export type AccountCapabilities = {
  hasPublicProfiles: boolean;
  hasPushNotifications: boolean;
  hasSmsNotifications: boolean;
  hasMarketingNotifications: boolean;
  hasBilling: boolean;
  hasTeams: boolean;
  hasConnectedAccounts: boolean;
  hasDataExport: boolean;
  hasAccountDeletion: boolean;
};

export type AccountDigestFrequency = "instant" | "daily_digest" | "weekly_digest" | "off";

export type AccountNotificationTopic =
  | "security"
  | "account"
  | "billing"
  | "reminders"
  | "messages"
  | "mentions"
  | "comments"
  | "product"
  | "marketing";

export type AccountRouteItem = {
  description: string;
  href: string;
  label: string;
};

export type AccountProfile = {
  avatarPath: string | null;
  avatarUrl: string | null;
  bio: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWebsite: string | null;
  coverImagePath: string | null;
  coverImageUrl: string | null;
  displayName: string;
  headline: string | null;
  isDiscoverable: boolean;
  isPublic: boolean;
  noindex: boolean;
  shareLinkEnabled: boolean;
  shareSlug: string | null;
  shareToken: string | null;
  username: string | null;
};

export type AccountPreferences = {
  dashboardLayout: string;
  emailDigestFrequency: AccountDigestFrequency;
  highContrast: boolean;
  language: string;
  lastReauthenticatedAt: string | null;
  onboardingHintsEnabled: boolean;
  reducedMotion: boolean;
  subtitlesEnabled: boolean;
  theme: "light" | "dark" | "system";
  timezone: string;
};

export type AccountNotificationPreference = {
  description: string;
  emailEnabled: boolean;
  frequency: AccountDigestFrequency;
  inAppEnabled: boolean;
  label: string;
  pushEnabled: boolean;
  quietHoursEnd: string | null;
  quietHoursStart: string | null;
  smsEnabled: boolean;
  topic: AccountNotificationTopic;
  transactional: boolean;
  timezone: string;
};

export type AccountPushSubscription = {
  browserName: string | null;
  createdAt: string;
  deviceLabel: string | null;
  endpointPreview: string;
  id: string;
  isActive: boolean;
  lastSeenAt: string | null;
  permissionState: string;
  platformName: string | null;
};

export type AccountPasskey = {
  backedUp: boolean;
  createdAt: string;
  id: string;
  label: string;
  lastUsedAt: string | null;
  registrationStatus: string;
  transports: string[];
};

export type AccountSession = {
  approximateLocation: string | null;
  browser: string | null;
  createdAt: string;
  current: boolean;
  id: string;
  lastActiveAt: string;
  os: string | null;
  revokedAt: string | null;
  sessionLabel: string | null;
  trusted: boolean;
};

export type AccountPrivacyRequest = {
  completedAt: string | null;
  createdAt: string;
  id: string;
  requestType: "export" | "delete";
  requestedExportFirst: boolean;
  status: "pending" | "processing" | "completed" | "rejected" | "cancelled";
  statusDetail: string | null;
};

export type AccountUserSummary = {
  createdAt: string;
  displayName: string;
  email: string | null;
  id: string;
  lastSignInAt: string | null;
};

export type AccountSnapshot = {
  capabilities: AccountCapabilities;
  notifications: AccountNotificationPreference[];
  passkeys: AccountPasskey[];
  preferences: AccountPreferences;
  privacyRequests: AccountPrivacyRequest[];
  profile: AccountProfile;
  pushSubscriptions: AccountPushSubscription[];
  sessions: AccountSession[];
  user: AccountUserSummary;
};
