import { redirect } from "next/navigation";

import { CampaignOnboardingForm } from "@/components/onboarding/campaign-onboarding-form";
import { ButtonLink } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getSignedInDestination } from "@/lib/auth/navigation";
import { requireUserContext } from "@/lib/data/user-context";

export default async function CampaignOnboardingPage() {
  const context = await requireUserContext();

  if (!context.profile?.role) {
    redirect("/signup?step=role");
  }

  if (context.profile.role !== "campaign") {
    redirect(getSignedInDestination(context.profile));
  }

  if (context.profile.onboarding_completed && context.organization && context.campaignProfile) {
    redirect("/dashboard/campaign");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-14">
      <CampaignOnboardingForm
        campaignProfile={context.campaignProfile}
        organization={context.organization}
      />

      <SurfaceCard className="h-fit p-8 lg:sticky lg:top-24">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-slate-950">What this unlocks</h2>
          <ul className="space-y-3 text-sm leading-7 text-slate-600">
            <li>A campaign dashboard shell focused on creator activation rather than generic marketplace browsing.</li>
            <li>Structured fields for organization, initiative, budget, and timeline.</li>
            <li>A stronger foundation for future creator briefing, invite, and tracked-link workflows.</li>
          </ul>
          <ButtonLink href="/for-campaigns" variant="secondary">
            Review campaign fit
          </ButtonLink>
        </div>
      </SurfaceCard>
    </div>
  );
}
