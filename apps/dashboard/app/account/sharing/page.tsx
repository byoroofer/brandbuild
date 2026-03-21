import { SettingsSection } from "@/components/account/settings-section";
import { ShareProfileCard } from "@/components/account/share-profile-card";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export default async function AccountSharingPage() {
  const context = await requireAccountRequestContext();
  const snapshot = await getAccountSnapshot(context);

  return (
    <SettingsSection
      description="Toggle public visibility, manage discoverability, and preview exactly what external visitors would see when public sharing is enabled."
      eyebrow="Sharing"
      title="Sharing and public profile"
    >
      <ShareProfileCard capabilities={snapshot.capabilities} profile={snapshot.profile} />
    </SettingsSection>
  );
}
