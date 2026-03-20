import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getSignedInDestination } from "@/lib/auth/navigation";
import { requireUserContext } from "@/lib/data/user-context";

export default async function CampaignDashboardPage() {
  const context = await requireUserContext();

  if (!context.profile?.role) {
    redirect("/signup?step=role");
  }

  if (context.profile.role !== "campaign") {
    redirect(getSignedInDestination(context.profile));
  }

  if (!context.profile.onboarding_completed) {
    redirect("/campaign/onboarding");
  }

  return (
    <>
      <SurfaceCard className="overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_46%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
              Campaign dashboard
            </span>
            <div className="space-y-3">
              <h1 className="display-font text-5xl leading-none text-slate-950 sm:text-6xl">
                {context.organization?.name ?? "Campaign workspace"} is set up for creator activation.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                Milestone 1 gives your team a structured shell for creator program setup without pretending the full marketplace and billing stack is already live.
              </p>
            </div>
          </div>

          <ButtonLink href="/campaign/onboarding" size="lg" variant="secondary">
            Edit campaign setup
          </ButtonLink>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <SurfaceCard className="p-8">
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-slate-950">Campaign snapshot</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Initiative</p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {context.campaignProfile?.campaign_name ?? "Add in onboarding"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Geography focus</p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {context.campaignProfile?.geography_focus ?? "Add in onboarding"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Creator budget</p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {context.campaignProfile?.creator_budget ?? "Add in onboarding"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Launch timeline</p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {context.campaignProfile?.launch_timeline ?? "Add in onboarding"}
                  </p>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">What's next</h2>
              <ul className="space-y-3 text-sm leading-7 text-slate-600">
                <li>Use this shell as the base for future creator invites and briefing flows.</li>
                <li>Align internal stakeholders around a clearer creator activation setup.</li>
                <li>Keep the product focused on political operations rather than a broad marketplace model.</li>
              </ul>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard className="h-fit p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">Creator goal</h2>
            <p className="text-sm leading-7 text-slate-600">
              {context.campaignProfile?.creator_goal ??
                "Complete campaign onboarding to add your creator activation goal here."}
            </p>
          </div>
        </SurfaceCard>
      </div>
    </>
  );
}
