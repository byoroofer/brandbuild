"use client";

import { useState } from "react";

import { PasskeyManager } from "@/components/account/passkey-manager";
import { SaveBar } from "@/components/account/save-bar";
import type { AccountPasskey } from "@/lib/account/types";

type SecuritySettingsFormProps = {
  authEmail: string | null;
  displayName: string;
  lastReauthenticatedAt: string | null;
  lastSignInAt: string | null;
  passkeys: AccountPasskey[];
};

export function SecuritySettingsForm({
  authEmail,
  displayName,
  lastReauthenticatedAt,
  lastSignInAt,
  passkeys,
}: SecuritySettingsFormProps) {
  const [email, setEmail] = useState(authEmail ?? "");
  const [password, setPassword] = useState("");
  const [reauthPassword, setReauthPassword] = useState("");
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function reauthenticate() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/me/reauth", {
      body: JSON.stringify({ password: reauthPassword }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    const payload = await response.json();

    setMessage(
      response.ok
        ? payload.message ?? "Verification complete."
        : payload.error ?? "Verification failed.",
    );
    setIsSaving(false);
  }

  async function save() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/me/profile", {
      body: JSON.stringify({
        authEmail: email || null,
        displayName,
        newPassword: password || null,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't update your security settings.");
      setIsSaving(false);
      return;
    }

    setDirty(false);
    setPassword("");
    setMessage(payload.message ?? "Security settings updated.");
    setIsSaving(false);
  }

  return (
    <>
      <div className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Recent authentication</p>
              <p className="mt-2 text-sm text-slate-400">
                Last sign-in: {lastSignInAt ? new Date(lastSignInAt).toLocaleString() : "Unavailable"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Last confirmed sensitive action:{" "}
                {lastReauthenticatedAt
                  ? new Date(lastReauthenticatedAt).toLocaleString()
                  : "Not verified yet"}
              </p>
            </div>

            <div className="rounded-[24px] border border-cyan-400/14 bg-cyan-400/8 p-4 text-sm leading-6 text-cyan-50/90">
              Changing the sign-in email sends a branded BrandBuild confirmation email. If Secure
              Email Change is enabled in Supabase, both the current and new address will need to
              confirm before the switch completes.
            </div>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Change sign-in email
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setDirty(true);
                }}
                value={email}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                New password
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setDirty(true);
                }}
                type="password"
                value={password}
              />
            </label>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">Confirm your password</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Sensitive actions require recent verification before email, password, deletion,
              or global sign-out changes are accepted.
            </p>
            <label className="mt-4 grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Current password
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => setReauthPassword(event.target.value)}
                type="password"
                value={reauthPassword}
              />
            </label>
            <button className="brandbuild-primary-button mt-4 h-11 px-4" onClick={reauthenticate} type="button">
              Verify now
            </button>
          </div>
        </div>

        <PasskeyManager passkeys={passkeys} />
      </div>

      <SaveBar dirty={dirty} isSaving={isSaving} message={dirty ? null : message} onSave={save} />
    </>
  );
}
