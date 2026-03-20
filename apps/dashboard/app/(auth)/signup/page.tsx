import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getOptionalUser } from "@/lib/auth/session";
import { getSearchParamValue } from "@/lib/utils";

type SignupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectPath = getSafeRedirectPath(
    getSearchParamValue(resolvedSearchParams.redirectedFrom),
  );
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_440px] lg:px-8 lg:py-14">
      <SurfaceCard className="hidden overflow-hidden p-10 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_46%)]" />
        <div className="relative space-y-8">
          <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-cyan-700 uppercase">
            Internal team setup
          </span>
          <div className="space-y-4">
            <h2 className="display-font text-6xl leading-none text-slate-950">
              Create internal access for AI Video Studio.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              This is a simple operator account flow for your studio team, not a consumer signup experience.
            </p>
          </div>
        </div>
      </SurfaceCard>

      <SignupForm redirectPath={redirectPath} />
    </div>
  );
}
