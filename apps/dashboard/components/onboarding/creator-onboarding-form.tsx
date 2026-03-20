"use client";

import { useActionState } from "react";

import { saveCreatorOnboardingAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { CreatorProfileRow } from "@/lib/data/user-context";
import { initialActionState } from "@/lib/forms/action-state";

type CreatorOnboardingFormProps = {
  initialValues: CreatorProfileRow | null;
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300";

export function CreatorOnboardingForm({ initialValues }: CreatorOnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveCreatorOnboardingAction,
    initialActionState,
  );

  return (
    <SurfaceCard className="p-8 sm:p-10">
      <div className="space-y-8">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
            Creator onboarding
          </span>
          <div className="space-y-2">
            <h1 className="display-font text-4xl leading-none text-slate-950">Set up your creator profile</h1>
            <p className="text-base leading-7 text-slate-600">
              Keep this tight and clear so campaigns can understand your voice quickly.
            </p>
          </div>
        </div>

        <form action={formAction} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="display-name">
                Display name
              </label>
              <input
                className={inputClassName}
                defaultValue={initialValues?.display_name ?? ""}
                id="display-name"
                name="displayName"
                placeholder="Jordan Fields"
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="primary-platform">
                Primary platform
              </label>
              <input
                className={inputClassName}
                defaultValue={initialValues?.primary_platform ?? ""}
                id="primary-platform"
                name="primaryPlatform"
                placeholder="TikTok, Instagram Reels, YouTube Shorts"
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="content-focus">
                Content focus
              </label>
              <input
                className={inputClassName}
                defaultValue={initialValues?.content_focus ?? ""}
                id="content-focus"
                name="contentFocus"
                placeholder="Politics, culture, issue explainers"
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="audience-size">
                Audience size
              </label>
              <input
                className={inputClassName}
                defaultValue={initialValues?.audience_size ?? ""}
                id="audience-size"
                name="audienceSize"
                placeholder="10k-50k"
                required
                type="text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="home-base">
              Home base
            </label>
            <input
              className={inputClassName}
              defaultValue={initialValues?.home_base ?? ""}
              id="home-base"
              name="homeBase"
              placeholder="Chicago, IL"
              required
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="bio">
              Short bio
            </label>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
              defaultValue={initialValues?.bio ?? ""}
              id="bio"
              name="bio"
              placeholder="Give campaigns a concise sense of your voice, your audience, and the kind of political work you want to do."
              required
            />
          </div>

          {state.error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </p>
          ) : null}

          <Button className="w-full sm:w-auto" disabled={isPending} size="lg" type="submit">
            {isPending ? "Saving creator profile..." : "Complete creator onboarding"}
          </Button>
        </form>
      </div>
    </SurfaceCard>
  );
}
