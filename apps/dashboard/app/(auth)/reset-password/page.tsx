import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { BrandbuildLogo } from "@/components/site/brandbuild-logo";
import { SurfaceCard } from "@/components/ui/surface-card";

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_440px] lg:px-8 lg:py-14">
      <SurfaceCard className="hidden overflow-hidden p-10 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_46%)]" />
        <div className="relative space-y-8">
          <BrandbuildLogo alt="BrandBuild" className="h-14 w-auto" priority />
          <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-cyan-700 uppercase">
            Branded recovery flow
          </span>
          <div className="space-y-4">
            <h2 className="display-font text-6xl leading-none text-slate-950">
              Password recovery should still feel like BrandBuild.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Reset links, confirmation screens, and secure account actions stay inside the app so
              the operator experience remains trustworthy from inbox to dashboard.
            </p>
          </div>
        </div>
      </SurfaceCard>

      <ResetPasswordForm />
    </div>
  );
}
