import { PrivacySettingsForm } from "@/components/account/privacy-settings-form";
import { SettingsSection } from "@/components/account/settings-section";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export default async function AccountPrivacyPage() {
  const context = await requireAccountRequestContext();
  const snapshot = await getAccountSnapshot(context);
  const marketingPreference = snapshot.notifications.find((item) => item.topic === "marketing");

  return (
    <SettingsSection
      description="Control optional marketing contact, request exports, and submit deletion requests with enterprise guardrails."
      eyebrow="Privacy"
      title="Privacy and data"
    >
      <PrivacySettingsForm
        capabilities={snapshot.capabilities}
        initialMarketingOptIn={Boolean(marketingPreference?.emailEnabled || marketingPreference?.inAppEnabled)}
        requests={snapshot.privacyRequests}
      />
    </SettingsSection>
  );
}

