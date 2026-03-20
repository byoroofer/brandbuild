import { MediaFrame } from "@/components/marketing/media-frame";
import { cx } from "@/lib/utils";
import type { ProviderCatalogItem } from "@/lib/studio/providers/types";
import type { WorkspaceMode } from "@/lib/studio/types";

type ControlRoomPreviewProps = {
  mode: WorkspaceMode;
  providers: ProviderCatalogItem[];
};

const providerAccents: Record<
  ProviderCatalogItem["id"],
  {
    chip: string;
    frameTone: "cyan" | "gold" | "violet" | "emerald";
  }
> = {
  higgsfield: {
    chip: "border-violet-400/28 bg-violet-500/16 text-violet-100",
    frameTone: "violet",
  },
  kling: {
    chip: "border-cyan-400/28 bg-cyan-500/14 text-cyan-100",
    frameTone: "cyan",
  },
  sora: {
    chip: "border-amber-300/28 bg-amber-400/14 text-amber-100",
    frameTone: "gold",
  },
};

function getProviderStatusLabel(provider: ProviderCatalogItem) {
  if (provider.integrationStage === "live" && provider.configured) {
    return "Live";
  }

  if (provider.integrationStage === "live") {
    return "Ready";
  }

  return "Planned";
}

export function ControlRoomPreview({ mode, providers }: ControlRoomPreviewProps) {
  return (
    <div className="brandbuild-panel relative overflow-hidden rounded-[36px] p-4 sm:p-6 lg:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(103,180,255,0.16),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(255,205,116,0.12),transparent_20%),linear-gradient(180deg,rgba(8,10,14,0.46),rgba(8,10,14,0.88))]" />

      <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <p className="text-xs font-medium tracking-[0.24em] text-white/46 uppercase">
            Product control room
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
            Multi-model generation, review, and assembly in one live console.
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-white/68 uppercase">
            {mode === "live" ? "Live workspace" : "Demo workspace"}
          </span>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-emerald-100 uppercase">
            Assets synced
          </span>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-cyan-100 uppercase">
            Review memory active
          </span>
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_280px]">
        <div className="space-y-3">
          {[
            {
              label: "Campaign stack",
              title: "Luma drink launch",
              detail: "12 shots · 3 aspect ratios · 4 review checkpoints",
            },
            {
              label: "Scene memory",
              title: "Opening hook approved",
              detail: "Hero spin, rooftop sip, condensation macro, closing CTA",
            },
            {
              label: "Asset memory",
              title: "References linked",
              detail: "Moodboards, packaging renders, product stills, selects",
            },
          ].map((item) => (
            <div
              className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              key={item.title}
            >
              <p className="text-[11px] font-medium tracking-[0.18em] text-white/44 uppercase">
                {item.label}
              </p>
              <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-white">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/58">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] text-white/44 uppercase">
                  Active shot
                </p>
                <h4 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
                  Rooftop sip reveal with premium product finish
                </h4>
              </div>
              <span className="rounded-full border border-white/8 bg-white/6 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-white/68 uppercase">
                9:16 · 8 sec
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <MediaFrame
                badge="Select"
                className="h-[280px]"
                description="Primary hero render for brand polish, packaging fidelity, and reflective studio finish."
                slotId="control-room-hero-master"
                title="Hero master"
                tone="gold"
              >
                <div className="rounded-2xl border border-white/8 bg-black/26 px-3 py-2 text-xs leading-5 text-white/74">
                  Sora handles premium product realism and controlled hero composition.
                </div>
              </MediaFrame>

              <MediaFrame
                badge="Alt take"
                className="h-[280px]"
                description="Performance pass for natural talent motion, pacing, and social-native body language."
                slotId="control-room-kling-performance"
                title="Performance alt"
                tone="cyan"
              >
                <div className="rounded-2xl border border-white/8 bg-black/26 px-3 py-2 text-xs leading-5 text-white/74">
                  Kling brings the human beat, lip-sync readiness, and motion control.
                </div>
              </MediaFrame>
            </div>

            <div className="mt-4 rounded-[28px] border border-white/8 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.18em] text-white/44 uppercase">
                    Prompt and review state
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/68">
                    Subject, motion, camera, environment, lighting, and constraints stay versioned
                    beside every run.
                  </p>
                </div>
                <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-amber-100 uppercase">
                  2 selects ready
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {providers.map((provider) => {
            const accent = providerAccents[provider.id];

            return (
              <div
                className="rounded-[28px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                key={provider.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.18em] text-white/44 uppercase">
                      {provider.id}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                      {provider.label}
                    </h4>
                  </div>
                  <span
                    className={cx(
                      "rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase",
                      accent.chip,
                    )}
                  >
                    {getProviderStatusLabel(provider)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/60">{provider.fitSummary}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {provider.capabilities.map((capability) => (
                    <span
                      className="rounded-full border border-white/8 bg-black/18 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-white/62 uppercase"
                      key={capability}
                    >
                      {capability.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="rounded-[28px] border border-white/8 bg-black/20 p-4">
            <p className="text-[11px] font-medium tracking-[0.18em] text-white/44 uppercase">
              Team review
            </p>
            <div className="mt-3 space-y-3">
              {[
                { label: "Realism", value: "9.1" },
                { label: "Brand fit", value: "8.8" },
                { label: "Hook strength", value: "8.5" },
              ].map((metric) => (
                <div className="flex items-center justify-between gap-3" key={metric.label}>
                  <span className="text-sm text-white/60">{metric.label}</span>
                  <span className="text-sm font-semibold text-white">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
