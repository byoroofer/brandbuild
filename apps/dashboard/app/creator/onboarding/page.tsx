import { redirect } from "next/navigation";

import { CreatorOnboardingForm } from "@/components/onboarding/creator-onboarding-form";
import { ButtonLink } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getSignedInDestination } from "@/lib/auth/navigation";
import { requireUserContext } from "@/lib/data/user-context";

export default async function CreatorOnboardingPage() {
  const context = await requireUserContext();

  if (!context.profile?.role) {
    redirect("/signup?step=role");
  }

  if (context.profile.role !== "creator") {
    redirect(getSignedInDestination(context.profile));
  }

  if (context.profile.onboarding_completed && context.creatorProfile) {
    redirect("/dashboard/creator");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-14">
      <CreatorOnboardingForm initialValues={context.creatorProfile} />

      <SurfaceCard className="h-fit p-8 lg:sticky lg:top-24">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-slate-950">What this unlocks</h2>
          <ul className="space-y-3 text-sm leading-7 text-slate-600">
            <li>A creator dashboard shell shaped for campaign collaboration.</li>
            <li>A cleaner surface for future political briefs and approvals.</li>
            <li>A profile that reads like campaign-fit information, not generic creator marketplace copy.</li>
          </ul>
          <ButtonLink href="/for-creators" variant="secondary">
            Review creator benefits
          </ButtonLink>
        </div>
      </SurfaceCard>
    </div>
  );
}
