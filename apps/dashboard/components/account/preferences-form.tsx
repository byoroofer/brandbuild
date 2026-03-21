"use client";

import { useState } from "react";

import { SaveBar } from "@/components/account/save-bar";
import type { AccountPreferences } from "@/lib/account/types";

type PreferencesFormProps = {
  initialValue: AccountPreferences;
};

export function PreferencesForm({ initialValue }: PreferencesFormProps) {
  const [draft, setDraft] = useState(initialValue);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/me/preferences", {
      body: JSON.stringify(draft),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't update your preferences.");
      setIsSaving(false);
      return;
    }

    setDirty(false);
    setMessage("Preferences updated.");
    setIsSaving(false);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
            Theme
          </span>
          <select
            className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                theme: event.target.value as AccountPreferences["theme"],
              }));
              setDirty(true);
            }}
            value={draft.theme}
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
            Timezone
          </span>
          <input
            className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
            onChange={(event) => {
              setDraft((current) => ({ ...current, timezone: event.target.value }));
              setDirty(true);
            }}
            value={draft.timezone}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
            Language
          </span>
          <input
            className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
            onChange={(event) => {
              setDraft((current) => ({ ...current, language: event.target.value }));
              setDirty(true);
            }}
            value={draft.language}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
            Default digest frequency
          </span>
          <select
            className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                emailDigestFrequency:
                  event.target.value as AccountPreferences["emailDigestFrequency"],
              }));
              setDirty(true);
            }}
            value={draft.emailDigestFrequency}
          >
            <option value="instant">Instant</option>
            <option value="daily_digest">Daily digest</option>
            <option value="weekly_digest">Weekly digest</option>
            <option value="off">Off</option>
          </select>
        </label>

        <label className="grid gap-2 sm:col-span-2">
          <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
            Dashboard layout
          </span>
          <input
            className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                dashboardLayout: event.target.value,
              }));
              setDirty(true);
            }}
            value={draft.dashboardLayout}
          />
        </label>

        {[
          { key: "onboardingHintsEnabled", label: "Show onboarding hints" },
          { key: "reducedMotion", label: "Reduce motion effects" },
          { key: "highContrast", label: "Enable high contrast" },
          { key: "subtitlesEnabled", label: "Prefer subtitles" },
        ].map((item) => (
          <label
            className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3"
            key={item.key}
          >
            <span className="text-sm text-slate-200">{item.label}</span>
            <input
              checked={draft[item.key as keyof AccountPreferences] as boolean}
              className="h-4 w-4 accent-amber-300"
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  [item.key]: event.target.checked,
                }));
                setDirty(true);
              }}
              type="checkbox"
            />
          </label>
        ))}
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
