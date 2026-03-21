"use client";

import { useState } from "react";

import { PrivacyRequestPanel } from "@/components/account/privacy-request-panel";
import { SaveBar } from "@/components/account/save-bar";
import type {
  AccountCapabilities,
  AccountPrivacyRequest,
} from "@/lib/account/types";

type PrivacySettingsFormProps = {
  capabilities: AccountCapabilities;
  initialMarketingOptIn: boolean;
  requests: AccountPrivacyRequest[];
};

export function PrivacySettingsForm({
  capabilities,
  initialMarketingOptIn,
  requests,
}: PrivacySettingsFormProps) {
  const [marketingOptIn, setMarketingOptIn] = useState(initialMarketingOptIn);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/me/privacy", {
      body: JSON.stringify({ marketingOptIn }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't update your privacy settings.");
      setIsSaving(false);
      return;
    }

    setDirty(false);
    setMessage("Privacy settings updated.");
    setIsSaving(false);
  }

  return (
    <>
      <div className="grid gap-5">
        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <label className="flex items-center justify-between gap-4 rounded-[22px] border border-white/8 bg-black/20 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Marketing notifications</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Transactional notices remain separate from optional product and marketing updates.
              </p>
            </div>
            <input
              checked={marketingOptIn}
              className="h-4 w-4 accent-amber-300"
              onChange={(event) => {
                setMarketingOptIn(event.target.checked);
                setDirty(true);
              }}
              type="checkbox"
            />
          </label>

          <div className="mt-4 rounded-[22px] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-400">
            Profile correction flows, data export requests, and deletion requests are tracked
            below with status visibility built into the account center.
          </div>
        </div>

        <PrivacyRequestPanel capabilities={capabilities} requests={requests} />
      </div>

      <SaveBar
        dirty={dirty}
        isSaving={isSaving}
        message={dirty ? null : message}
        onSave={save}
      />
    </>
  );
}
