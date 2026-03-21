import { SessionList } from "@/components/account/session-list";
import { SettingsSection } from "@/components/account/settings-section";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export default async function AccountSessionsPage() {
  const context = await requireAccountRequestContext();
  const snapshot = await getAccountSnapshot(context);

  return (
    <SettingsSection
      description="Inspect active devices, revoke trusted sessions, and force sign-out actions from a single session registry."
      eyebrow="Sessions"
      title="Sessions and devices"
    >
      <SessionList sessions={snapshot.sessions} />
    </SettingsSection>
  );
}

