import { PreferencesForm } from "@/components/account/preferences-form";
import { SettingsSection } from "@/components/account/settings-section";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export default async function AccountPreferencesPage() {
  const context = await requireAccountRequestContext();
  const snapshot = await getAccountSnapshot(context);

  return (
    <SettingsSection
      description="Theme, timezone, digest defaults, and accessibility-oriented workspace preferences."
      eyebrow="Preferences"
      title="Operator preferences"
    >
      <PreferencesForm initialValue={snapshot.preferences} />
    </SettingsSection>
  );
}

