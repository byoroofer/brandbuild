import { SecuritySettingsForm } from "@/components/account/security-settings-form";
import { SettingsSection } from "@/components/account/settings-section";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export default async function AccountSecurityPage() {
  const context = await requireAccountRequestContext();
  const snapshot = await getAccountSnapshot(context);

  return (
    <SettingsSection
      description="Sensitive account changes require recent verification. Passkeys live behind the same reusable security shell for sites that enable them."
      eyebrow="Security"
      title="Security and login"
    >
      <SecuritySettingsForm
        authEmail={snapshot.user.email}
        displayName={snapshot.profile.displayName}
        lastReauthenticatedAt={snapshot.preferences.lastReauthenticatedAt}
        lastSignInAt={snapshot.user.lastSignInAt}
        passkeys={snapshot.passkeys}
      />
    </SettingsSection>
  );
}
