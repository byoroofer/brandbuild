"use client";

import { useActionState } from "react";

import { saveCampaignOnboardingAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { CampaignProfileRow, OrganizationRow } from "@/lib/data/user-context";
import { initialActionState } from "@/lib/forms/action-state";

type CampaignOnboardingFormProps = {
  campaignProfile: CampaignProfileRow | null;
  organization: OrganizationRow | null;
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300";

export function CampaignOnboardingForm({
  campaignProfile,
  organization,
}: CampaignOnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveCampaignOnboardingAction,
    initialActionState,
  );

  return (
    <SurfaceCard className="p-8 sm:p-10">
      <div className="space-y-8">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
            Campaign onboarding
          </span>
          <div className="space-y-2">
            <h1 className="display-font text-4xl leading-none text-slate-950">
              Set up your campaign workspace
            </h1>
            <p className="text-base leading-7 text-slate-600">
              Capture the basics so your team can start briefing, inviting, and managing creators with confidence.
            </p>
          </div>
        </div>

        <form action={formAction} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="organization-name">
                Organization name
              </label>
              <input
                className={inputClassName}
                defaultValue={organization?.name ?? ""}
                id="organization-name"
                name="organizationName"
                placeholder="Friends of ..."
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="organization-type">
                Organization type
              </label>
              <input
                className={inputClassName}
                defaultValue={organization?.organization_type ?? ""}
                id="organization-type"
                name="organizationType"
                placeholder="Candidate campaign, PAC, advocacy group"
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="campaign-name">
                Campaign or initiative name
              </label>
              <input
                className={inputClassName}
                defaultValue={campaignProfile?.campaign_name ?? ""}
                id="campaign-name"
                name="campaignName"
                placeholder="2026 persuasion program"
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="geography-focus">
                Geography focus
              </label>
              <input
                className={inputClassName}
                defaultValue={campaignProfile?.geography_focus ?? ""}
                id="geography-focus"
                name="geographyFocus"
                placeholder="Michigan statewide"
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="creator-budget">
                Creator budget range
              </label>
              <input
                className={inputClassName}
                defaultValue={campaignProfile?.creator_budget ?? ""}
                id="creator-budget"
                name="creatorBudget"
                placeholder="$5k-$15k pilot"
                required
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="launch-timeline">
                Launch timeline
              </label>
              <input
                className={inputClassName}
                defaultValue={campaignProfile?.launch_timeline ?? ""}
                id="launch-timeline"
                name="launchTimeline"
                placeholder="Within 3 weeks"
                required
                type="text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="website-url">
              Website URL
            </label>
            <input
              className={inputClassName}
              defaultValue={organization?.website_url ?? ""}
              id="website-url"
              name="websiteUrl"
              placeholder="https://example.com"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="creator-goal">
              Creator goal
            </label>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
              defaultValue={campaignProfile?.creator_goal ?? ""}
              id="creator-goal"
              name="creatorGoal"
              placeholder="Describe what you need creators to help achieve, from persuasion content to interview clips or merch/action pushes."
              required
            />
          </div>

          {state.error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </p>
          ) : null}

          <Button className="w-full sm:w-auto" disabled={isPending} size="lg" type="submit">
            {isPending ? "Saving campaign profile..." : "Complete campaign onboarding"}
          </Button>
        </form>
      </div>
    </SurfaceCard>
  );
}
