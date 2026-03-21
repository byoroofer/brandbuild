import type { AccountCapabilities } from "@/lib/account/types";

export const brandbuildAccountCapabilities: AccountCapabilities = {
  hasAccountDeletion: true,
  hasBilling: true,
  hasConnectedAccounts: false,
  hasDataExport: true,
  hasMarketingNotifications: true,
  hasPublicProfiles: false,
  hasPushNotifications: false,
  hasSmsNotifications: false,
  hasTeams: true,
};

export function getAccountCapabilities() {
  return brandbuildAccountCapabilities;
}
