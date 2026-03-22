"use client";

import { ButtonLink } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

export function RoleSelectionForm() {
  return (
    <SurfaceCard className="p-8 sm:p-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
            BrandBuild access
          </span>
          <div className="space-y-2">
            <h1 className="display-font text-4xl leading-none text-slate-950">
              BrandBuild no longer uses role-based signup.
            </h1>
            <p className="text-base leading-7 text-slate-600">
              Continue straight into the core dashboard experience for campaigns, shots, assets,
              reviews, and generation workflow.
            </p>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-6">
          <p className="text-sm leading-7 text-slate-600">
            Older creator and campaign onboarding lanes were inherited from a different product and
            are now retired inside BrandBuild.
          </p>
          <ButtonLink className="mt-5 w-full sm:w-auto" href="/dashboard" size="lg">
            Open dashboard
          </ButtonLink>
        </div>
      </div>
    </SurfaceCard>
  );
}
