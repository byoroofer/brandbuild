import type {
  AccountNotificationTopic,
  AccountRouteItem,
} from "@/lib/account/types";

export const accountRouteItems: AccountRouteItem[] = [
  {
    description: "Summary, quick controls, and status across your account modules.",
    href: "/account",
    label: "Overview",
  },
  {
    description: "Display name, avatar, contact-safe fields, and public card preview.",
    href: "/account/profile",
    label: "Profile",
  },
  {
    description: "Channel preferences, quiet hours, and transactional alert controls.",
    href: "/account/notifications",
    label: "Notifications",
  },
  {
    description: "Email, password, passkeys, and high-sensitivity auth controls.",
    href: "/account/security",
    label: "Security",
  },
  {
    description: "Data handling, export, deletion requests, and privacy controls.",
    href: "/account/privacy",
    label: "Privacy",
  },
  {
    description: "Active devices, recent sessions, and server-side sign-out actions.",
    href: "/account/sessions",
    label: "Sessions",
  },
  {
    description: "Theme, timezone, digest defaults, and workspace-level preferences.",
    href: "/account/preferences",
    label: "Preferences",
  },
  {
    description: "Sharing controls, public card preview, and link management.",
    href: "/account/sharing",
    label: "Sharing",
  },
];

export const accountNotificationTopicMetadata: Array<{
  description: string;
  label: string;
  topic: AccountNotificationTopic;
  transactional: boolean;
}> = [
  {
    description: "Mandatory account protection and sign-in alerts.",
    label: "Security",
    topic: "security",
    transactional: true,
  },
  {
    description: "Account changes, invites, and administrative updates.",
    label: "Account",
    topic: "account",
    transactional: true,
  },
  {
    description: "Invoices, receipts, payment retries, and subscription changes.",
    label: "Billing",
    topic: "billing",
    transactional: true,
  },
  {
    description: "Workflow reminders, due dates, and unattended queue notices.",
    label: "Reminders",
    topic: "reminders",
    transactional: false,
  },
  {
    description: "Direct messages and operator communication threads.",
    label: "Messages",
    topic: "messages",
    transactional: false,
  },
  {
    description: "Mentions inside reviews, notes, and shared workspace threads.",
    label: "Mentions",
    topic: "mentions",
    transactional: false,
  },
  {
    description: "Comments on assets, shots, and campaign workspaces.",
    label: "Comments",
    topic: "comments",
    transactional: false,
  },
  {
    description: "Product updates, release notes, and workflow improvements.",
    label: "Product",
    topic: "product",
    transactional: false,
  },
  {
    description: "Announcements, launches, and optional marketing messages.",
    label: "Marketing",
    topic: "marketing",
    transactional: false,
  },
];

export const accountAvatarAllowedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const accountAvatarMaxBytes = 5 * 1024 * 1024;
export const accountReauthWindowMinutes = 20;
