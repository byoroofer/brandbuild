import { Panel } from "@/components/studio/panel";
import { StatusPill } from "@/components/studio/status-pill";
import type { ProviderCatalogItem } from "@/lib/studio/providers/types";

type ProviderCardProps = {
  provider: ProviderCatalogItem;
};

export function ProviderCard({ provider }: ProviderCardProps) {
  const status =
    provider.integrationStage === "live"
      ? provider.configured
        ? { label: "Live", tone: "success" as const }
        : { label: "Ready", tone: "warning" as const }
      : provider.configured
        ? { label: "Stubbed", tone: "warning" as const }
        : { label: "Planned", tone: "default" as const };

  return (
    <Panel className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            {provider.id}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{provider.label}</h3>
        </div>
        <StatusPill label={status.label} tone={status.tone} />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{provider.description}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{provider.fitSummary}</p>
      <p className="mt-3 text-xs tracking-[0.14em] text-slate-500 uppercase">
        {provider.integrationStage === "live"
          ? provider.configured
            ? "Live API path enabled"
            : "Live adapter wired, awaiting credentials"
          : "Adapter boundary in place, live API still to wire"}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {provider.capabilities.map((capability) => (
          <span
            className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs tracking-[0.16em] text-slate-300 uppercase"
            key={capability}
          >
            {capability.replaceAll("-", " ")}
          </span>
        ))}
      </div>
    </Panel>
  );
}
