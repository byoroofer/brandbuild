"use client";

import { useEffect, useState } from "react";

import { AccountEmptyState } from "@/components/account/account-empty-state";
import type { AccountCapabilities, AccountPushSubscription } from "@/lib/account/types";

type PushPermissionCardProps = {
  capabilities: AccountCapabilities;
  subscriptions: AccountPushSubscription[];
};

export function PushPermissionCard({
  capabilities,
  subscriptions,
}: PushPermissionCardProps) {
  const [permissionState, setPermissionState] = useState<string>("unsupported");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setPermissionState("unsupported");
      return;
    }

    setPermissionState(Notification.permission);
  }, []);

  async function handleEnable() {
    if (typeof Notification === "undefined") {
      setMessage("This browser does not support notifications.");
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermissionState(nextPermission);

    if (nextPermission !== "granted") {
      setMessage("Notification permission was not granted.");
      return;
    }

    setMessage(
      "Permission granted. Service worker subscription wiring can be enabled when this deployment turns on push notifications.",
    );
  }

  if (!capabilities.hasPushNotifications) {
    return (
      <AccountEmptyState
        description="Push notifications are hidden for this deployment. The component stays in place so portfolio projects can enable the module without changing the account architecture."
        title="Push delivery is disabled here"
      />
    );
  }

  return (
    <div className="rounded-[26px] border border-white/8 bg-black/20 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">Browser push</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Ask for permission only after explicit user action, then manage device-level
            subscriptions from the portal.
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-white/72 uppercase">
          {permissionState}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button className="brandbuild-primary-button h-11 px-4" onClick={handleEnable} type="button">
          Enable notifications
        </button>
      </div>

      {message ? (
        <p aria-live="polite" className="mt-3 text-sm text-slate-300">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        {subscriptions.length === 0 ? (
          <p className="text-sm text-slate-400">No active device subscriptions yet.</p>
        ) : (
          subscriptions.map((subscription) => (
            <div
              className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3"
              key={subscription.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">
                  {subscription.deviceLabel ?? "Device subscription"}
                </p>
                <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">
                  {subscription.permissionState}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {subscription.browserName ?? "Browser"} {subscription.platformName ? `on ${subscription.platformName}` : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

