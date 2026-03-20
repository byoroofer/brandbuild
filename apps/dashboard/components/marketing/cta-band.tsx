import { ButtonLink } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

type CtaBandProps = {
  actionHref: string;
  actionLabel: string;
  description: string;
  eyebrow: string;
  title: string;
};

export function CtaBand({
  actionHref,
  actionLabel,
  description,
  eyebrow,
  title,
}: CtaBandProps) {
  return (
    <SurfaceCard className="overflow-hidden bg-slate-950 p-8 text-white sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.26),transparent_28%),radial-gradient(circle_at_left,rgba(37,99,235,0.34),transparent_38%)]" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-100 uppercase">
            {eyebrow}
          </span>
          <div className="space-y-3">
            <h2 className="display-font text-4xl leading-none sm:text-5xl">{title}</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-300">{description}</p>
          </div>
        </div>
        <ButtonLink
          className="bg-white text-slate-950 hover:border-white"
          href={actionHref}
          size="lg"
          variant="secondary"
        >
          {actionLabel}
        </ButtonLink>
      </div>
    </SurfaceCard>
  );
}
