import { ProfileSettingsForm } from "@/components/account/profile-settings-form";
import { SettingsSection } from "@/components/account/settings-section";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export default async function AccountProfilePage() {
  const context = await requireAccountRequestContext();
  const snapshot = await getAccountSnapshot(context);

  return (
    <SettingsSection
      description="Update your display name, safe contact fields, avatar, and operator-facing profile preview."
      eyebrow="Profile"
      title="Profile settings"
    >
      <ProfileSettingsForm initialValue={snapshot.profile} />
    </SettingsSection>
  );
}

