import { NotificationsSettingsForm } from "@/components/account/notifications-settings-form";
import { SettingsSection } from "@/components/account/settings-section";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export default async function AccountNotificationsPage() {
  const context = await requireAccountRequestContext();
  const snapshot = await getAccountSnapshot(context);

  return (
    <SettingsSection
      description="Manage in-app, email, SMS, and push intent per topic while keeping transactional security alerts protected."
      eyebrow="Notifications"
      title="Notification matrix"
    >
      <NotificationsSettingsForm
        capabilities={snapshot.capabilities}
        initialNotifications={snapshot.notifications}
        subscriptions={snapshot.pushSubscriptions}
      />
    </SettingsSection>
  );
}

