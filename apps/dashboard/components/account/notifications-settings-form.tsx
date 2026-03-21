"use client";

import { useState } from "react";

import { NotificationMatrix } from "@/components/account/notification-matrix";
import { PushPermissionCard } from "@/components/account/push-permission-card";
import { SaveBar } from "@/components/account/save-bar";
import type {
  AccountCapabilities,
  AccountNotificationPreference,
  AccountPushSubscription,
} from "@/lib/account/types";

type NotificationsSettingsFormProps = {
  capabilities: AccountCapabilities;
  initialNotifications: AccountNotificationPreference[];
  subscriptions: AccountPushSubscription[];
};

export function NotificationsSettingsForm({
  capabilities,
  initialNotifications,
  subscriptions,
}: NotificationsSettingsFormProps) {
  const [draft, setDraft] = useState(initialNotifications);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/me/notifications", {
      body: JSON.stringify({
        preferences: draft,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "PUT",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't update your notification settings.");
      setIsSaving(false);
      return;
    }

    setDirty(false);
    setMessage("Notification settings updated.");
    setIsSaving(false);
  }

  return (
    <>
      <div className="grid gap-5">
        <NotificationMatrix
          capabilities={capabilities}
          onChange={(next) => {
            setDraft(next);
            setDirty(true);
          }}
          value={draft}
        />

        <PushPermissionCard capabilities={capabilities} subscriptions={subscriptions} />
      </div>

      <SaveBar
        dirty={dirty}
        isSaving={isSaving}
        message={dirty ? null : message}
        onReset={() => {
          setDraft(initialNotifications);
          setDirty(false);
          setMessage(null);
        }}
        onSave={save}
      />
    </>
  );
}

