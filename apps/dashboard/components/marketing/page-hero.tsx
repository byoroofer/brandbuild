import { ButtonLink } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

type HeroAction = {
  href: string;
  label: string;
};

type HeroStat = {
  label: string;
  value: string;
};

type PageHeroProps = {
  badge: string;
  description: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  stats: HeroStat[];
  title: string;
};

export function PageHero({
  badge,
  description,
  primaryAction,
  secondaryAction,
  stats,
  title,
}: PageHeroProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_360px] lg:items-start">
      <SurfaceCard className="overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_42%),radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_50%)]" />
        <div className="relative space-y-8">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
            {badge}
          </span>
          <div className="space-y-5">
            <h1 className="display-font max-w-4xl text-5xl leading-none text-slate-950 sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={primaryAction.href} size="lg">
              {primaryAction.label}
            </ButtonLink>
            {secondaryAction ? (
              <ButtonLink href={secondaryAction.href} size="lg" variant="secondary">
                {secondaryAction.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-4">
        {stats.map((stat) => (
          <SurfaceCard className="p-6" key={stat.label}>
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                {stat.label}
              </p>
              <p className="text-lg font-semibold leading-7 text-slate-950">{stat.value}</p>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}
