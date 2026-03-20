import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getSignedInDestination } from "@/lib/auth/navigation";
import { requireUserContext } from "@/lib/data/user-context";

export default async function CreatorDashboardPage() {
  const context = await requireUserContext();

  if (!context.profile?.role) {
    redirect("/signup?step=role");
  }

  if (context.profile.role !== "creator") {
    redirect(getSignedInDestination(context.profile));
  }

  if (!context.profile.onboarding_completed) {
    redirect("/creator/onboarding");
  }

  return (
    <>
      <SurfaceCard className="overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_46%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
              Creator dashboard
            </span>
            <div className="space-y-3">
              <h1 className="display-font text-5xl leading-none text-slate-950 sm:text-6xl">
                {context.creatorProfile?.display_name ?? context.profile.full_name ?? "Creator"} is ready for campaign work.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                Milestone 1 gives you a polished creator shell, a campaign-ready profile, and a clean base for future brief and invite workflows.
              </p>
            </div>
          </div>

          <ButtonLink href="/creator/onboarding" size="lg" variant="secondary">
            Edit creator profile
          </ButtonLink>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <SurfaceCard className="p-8">
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-slate-950">Profile snapshot</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Primary platform</p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {context.creatorProfile?.primary_platform ?? "Add in onboarding"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Audience size</p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {context.creatorProfile?.audience_size ?? "Add in onboarding"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Content focus</p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {context.creatorProfile?.content_focus ?? "Add in onboarding"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Home base</p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {context.creatorProfile?.home_base ?? "Add in onboarding"}
                  </p>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">What's next</h2>
              <ul className="space-y-3 text-sm leading-7 text-slate-600">
                <li>Prepare your profile for future campaign invites and briefs.</li>
                <li>Use this shell as your operational base once collaboration features expand.</li>
                <li>Keep your profile tight and politically legible rather than broad and generic.</li>
              </ul>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard className="h-fit p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">Bio preview</h2>
            <p className="text-sm leading-7 text-slate-600">
              {context.creatorProfile?.bio ??
                "Complete your creator onboarding to add a concise political creator bio here."}
            </p>
          </div>
        </SurfaceCard>
      </div>
    </>
  );
}
