"use client";

import { useState } from "react";

import { AvatarUploader } from "@/components/account/avatar-uploader";
import { SaveBar } from "@/components/account/save-bar";
import type { AccountProfile } from "@/lib/account/types";

type ProfileSettingsFormProps = {
  initialValue: AccountProfile;
};

export function ProfileSettingsForm({ initialValue }: ProfileSettingsFormProps) {
  const [draft, setDraft] = useState(initialValue);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/me/profile", {
      body: JSON.stringify({
        bio: draft.bio,
        contactEmail: draft.contactEmail,
        contactPhone: draft.contactPhone,
        contactWebsite: draft.contactWebsite,
        coverImagePath: draft.coverImagePath,
        displayName: draft.displayName,
        headline: draft.headline,
        username: draft.username,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't update your profile.");
      setIsSaving(false);
      return;
    }

    setDirty(false);
    setMessage("Profile updated.");
    setIsSaving(false);
  }

  return (
    <>
      <div className="grid gap-5">
        <AvatarUploader
          avatarUrl={draft.avatarUrl}
          onChange={(next) => {
            setDraft((current) => ({ ...current, ...next }));
            setDirty(true);
          }}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Display name
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, displayName: event.target.value }));
                  setDirty(true);
                }}
                value={draft.displayName}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Username / public slug
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, username: event.target.value || null }));
                  setDirty(true);
                }}
                value={draft.username ?? ""}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Headline
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, headline: event.target.value || null }));
                  setDirty(true);
                }}
                value={draft.headline ?? ""}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Bio
              </span>
              <textarea
                className="min-h-36 rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, bio: event.target.value || null }));
                  setDirty(true);
                }}
                value={draft.bio ?? ""}
              />
            </label>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Safe contact email
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    contactEmail: event.target.value || null,
                  }));
                  setDirty(true);
                }}
                value={draft.contactEmail ?? ""}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Safe contact phone
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    contactPhone: event.target.value || null,
                  }));
                  setDirty(true);
                }}
                value={draft.contactPhone ?? ""}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Safe contact website
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    contactWebsite: event.target.value || null,
                  }));
                  setDirty(true);
                }}
                value={draft.contactWebsite ?? ""}
              />
            </label>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Public card preview</p>
              <p className="mt-2 text-sm text-slate-300">{draft.displayName}</p>
              <p className="mt-1 text-sm text-slate-400">{draft.headline ?? "No headline"}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {draft.bio ?? "No profile summary yet."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        isSaving={isSaving}
        message={dirty ? null : message}
        onReset={() => {
          setDraft(initialValue);
          setDirty(false);
          setMessage(null);
        }}
        onSave={save}
      />
    </>
  );
}

