"use client";

import { useState } from "react";

import { AccountEmptyState } from "@/components/account/account-empty-state";
import type { AccountPasskey } from "@/lib/account/types";

type PasskeyManagerProps = {
  passkeys: AccountPasskey[];
};

export function PasskeyManager({ passkeys }: PasskeyManagerProps) {
  const [items, setItems] = useState(passkeys);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBeginRegistration() {
    setMessage(null);

    const response = await fetch("/api/me/passkeys/begin-registration", {
      method: "POST",
    });
    const payload = await response.json();

    setMessage(
      response.ok
        ? payload.message ?? "Passkey registration started."
        : payload.error ?? "Passkeys are not ready yet on this deployment.",
    );
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/me/passkeys/${id}`, {
      method: "DELETE",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't remove that passkey.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("Passkey removed.");
  }

  return (
    <div className="grid gap-4">
      {items.length === 0 ? (
        <AccountEmptyState
          action={
            <button
              className="brandbuild-primary-button h-11 px-4"
              onClick={handleBeginRegistration}
              type="button"
            >
              Enable passkeys
            </button>
          }
          description="This deployment has the passkey architecture, storage model, and API surface in place. WebAuthn ceremony wiring can be enabled when the relying-party domain and client runtime are finalized."
          title="No passkeys enrolled"
        />
      ) : (
        items.map((passkey) => (
          <div
            className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
            key={passkey.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{passkey.label}</p>
                <p className="mt-1 text-sm text-slate-400">
                  Status: {passkey.registrationStatus}. Added{" "}
                  {new Date(passkey.createdAt).toLocaleDateString()}.
                </p>
              </div>

              <button
                className="brandbuild-secondary-button h-11 px-4"
                onClick={() => handleDelete(passkey.id)}
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}

      {message ? (
        <p aria-live="polite" className="text-sm text-slate-300">
          {message}
        </p>
      ) : null}
    </div>
  );
}
