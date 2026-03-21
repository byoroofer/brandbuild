"use client";

import { useState } from "react";

import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";
import { SaveBar } from "@/components/account/save-bar";
import type { AccountCapabilities, AccountPrivacyRequest } from "@/lib/account/types";

type PrivacyRequestPanelProps = {
  capabilities: AccountCapabilities;
  requests: AccountPrivacyRequest[];
};

export function PrivacyRequestPanel({
  capabilities,
  requests,
}: PrivacyRequestPanelProps) {
  const [items, setItems] = useState(requests);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExportRequest() {
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/me/export", {
      body: JSON.stringify({}),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't create your export request.");
      setIsSubmitting(false);
      return;
    }

    setItems((current) => [payload.request, ...current]);
    setMessage("Export request submitted.");
    setIsSubmitting(false);
  }

  async function handleDeleteRequest(input: { exportFirst: boolean; note: string | null }) {
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/me/delete-request", {
      body: JSON.stringify({
        confirmText: "DELETE",
        exportFirst: input.exportFirst,
        note: input.note,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't create your deletion request.");
      setIsSubmitting(false);
      return;
    }

    setItems((current) => [payload.request, ...current]);
    setMessage("Deletion request submitted.");
    setIsSubmitting(false);
    setIsDeleteOpen(false);
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-lg font-semibold text-white">Data export</p>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Request a packaged export of your account settings and operator-visible data.
          </p>
          <button
            className="brandbuild-primary-button mt-5 h-11 px-4"
            disabled={!capabilities.hasDataExport || isSubmitting}
            onClick={handleExportRequest}
            type="button"
          >
            Request export
          </button>
        </div>

        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-lg font-semibold text-white">Account deletion</p>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Deletion requires recent re-authentication and preserves the audit trail without
            exposing deleted account data in the UI.
          </p>
          <button
            className="mt-5 rounded-full border border-red-300/22 bg-red-300/14 px-5 py-3 text-sm font-semibold text-red-50 transition hover:bg-red-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!capabilities.hasAccountDeletion || isSubmitting}
            onClick={() => setIsDeleteOpen(true)}
            type="button"
          >
            Request deletion
          </button>
        </div>
      </div>

      <div className="rounded-[26px] border border-white/8 bg-black/20 p-5">
        <p className="text-lg font-semibold text-white">Request history</p>
        <div className="mt-4 grid gap-3">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">No privacy requests submitted yet.</p>
          ) : (
            items.map((request) => (
              <div
                className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3"
                key={request.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">
                    {request.requestType === "export" ? "Data export" : "Delete account"}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-white/70 uppercase">
                    {request.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Submitted {new Date(request.createdAt).toLocaleString()}
                </p>
                {request.statusDetail ? (
                  <p className="mt-2 text-sm text-slate-300">{request.statusDetail}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <SaveBar dirty={false} message={message} />

      <DeleteAccountDialog
        isOpen={isDeleteOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteRequest}
      />
    </>
  );
}

