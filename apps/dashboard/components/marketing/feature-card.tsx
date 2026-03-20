import { SurfaceCard } from "@/components/ui/surface-card";

type FeatureCardProps = {
  description: string;
  kicker: string;
  title: string;
};

export function FeatureCard({ description, kicker, title }: FeatureCardProps) {
  return (
    <SurfaceCard className="h-full p-6">
      <div className="space-y-4">
        <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white uppercase">
          {kicker}
        </span>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </SurfaceCard>
  );
}
