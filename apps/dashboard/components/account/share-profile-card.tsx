"use client";

import { useState } from "react";

import { SaveBar } from "@/components/account/save-bar";
import type { AccountCapabilities, AccountProfile } from "@/lib/account/types";

type ShareProfileCardProps = {
  capabilities: AccountCapabilities;
  profile: AccountProfile;
};

export function ShareProfileCard({ capabilities, profile }: ShareProfileCardProps) {
  const [draft, setDraft] = useState(profile);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/me/privacy", {
      body: JSON.stringify({
        isDiscoverable: draft.isDiscoverable,
        isPublic: draft.isPublic,
        noindex: draft.noindex,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't save your sharing settings.");
      setIsSaving(false);
      return;
    }

    setDirty(false);
    setMessage("Sharing preferences updated.");
    setIsSaving(false);
  }

  async function rotateLink() {
    setMessage(null);

    const response = await fetch("/api/me/share-link", {
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't create a share link.");
      return;
    }

    setDraft((current) => ({
      ...current,
      shareLinkEnabled: true,
      shareSlug: payload.shareSlug ?? current.shareSlug,
      shareToken: payload.shareToken ?? current.shareToken,
    }));
    setMessage("Share link refreshed.");
  }

  if (!capabilities.hasPublicProfiles) {
    return (
      <div className="rounded-[26px] border border-white/8 bg-black/20 p-5">
        <p className="text-lg font-semibold text-white">Public profile sharing</p>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          This portfolio site keeps public profiles disabled. The route and card remain in
          the core architecture so other properties can enable them without a redesign.
        </p>
      </div>
    );
  }

  const shareUrl =
    typeof window !== "undefined" &&
    draft.shareLinkEnabled && draft.shareToken
      ? `${window.location.origin}/u/${draft.shareSlug ?? draft.shareToken}`
      : null;

  return (
    <>
      <div className="grid gap-4">
        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="flex items-center justify-between rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
              <span className="text-sm text-slate-200">Public profile</span>
              <input
                checked={draft.isPublic}
                className="h-4 w-4 accent-amber-300"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, isPublic: event.target.checked }));
                  setDirty(true);
                }}
                type="checkbox"
              />
            </label>

            <label className="flex items-center justify-between rounded-[20px] border border-white/8 bg-black/20 px-4 py-3">
              <span className="text-sm text-slate-200">Discoverable</span>
              <input
                checked={draft.isDiscoverable}
                className="h-4 w-4 accent-amber-300"
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    isDiscoverable: event.target.checked,
                  }));
                  setDirty(true);
                }}
                type="checkbox"
              />
            </label>

            <label className="flex items-center justify-between rounded-[20px] border border-white/8 bg-black/20 px-4 py-3 lg:col-span-2">
              <span className="text-sm text-slate-200">Noindex public profile</span>
              <input
                checked={draft.noindex}
                className="h-4 w-4 accent-amber-300"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, noindex: event.target.checked }));
                  setDirty(true);
                }}
                type="checkbox"
              />
            </label>
          </div>

          <div className="mt-4 rounded-[20px] border border-white/8 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">Public card preview</p>
            <p className="mt-1 text-sm text-slate-400">{draft.displayName}</p>
            <p className="mt-2 text-sm text-slate-300">{draft.headline ?? "No headline"}</p>
            <p className="mt-3 text-sm text-slate-400">
              {draft.bio ?? "No public bio yet."}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="brandbuild-primary-button h-11 px-4" onClick={rotateLink} type="button">
              Create share link
            </button>
            {shareUrl ? (
              <button
                className="brandbuild-secondary-button h-11 px-4"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                type="button"
              >
                Copy share link
              </button>
            ) : null}
          </div>

          {shareUrl ? (
            <p className="mt-3 text-sm text-slate-300">{shareUrl}</p>
          ) : null}
          {message ? (
            <p aria-live="polite" className="mt-3 text-sm text-slate-300">
              {message}
            </p>
          ) : null}
        </div>
      </div>

      <SaveBar dirty={dirty} isSaving={isSaving} message={dirty ? null : message} onSave={save} />
    </>
  );
}
