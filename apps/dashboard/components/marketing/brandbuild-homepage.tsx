import Link from "next/link";

import { ControlRoomPreview } from "@/components/marketing/control-room-preview";
import { MediaFrame } from "@/components/marketing/media-frame";
import { MediaMarquee } from "@/components/marketing/media-marquee";
import type { ProviderCatalogItem } from "@/lib/studio/providers/types";
import type { WorkspaceMode } from "@/lib/studio/types";
import { cx } from "@/lib/utils";

type BrandbuildHomepageProps = {
  mode: WorkspaceMode;
  providers: ProviderCatalogItem[];
};

const marqueeItems = [
  {
    badge: "Hero render",
    description: "High-gloss product macro for premium packaging, liquid detail, and launch polish.",
    slotId: "hero-product-macro",
    title: "Product macro pass",
    tone: "gold" as const,
  },
  {
    badge: "Performance",
    description: "Character motion, rhythm, and facial beats tuned for social-native pacing.",
    slotId: "kling-talent-motion",
    title: "Talent motion pass",
    tone: "cyan" as const,
  },
  {
    badge: "Exploration",
    description: "Concept testing for bolder worlds, transitions, and unusual cinematic setups.",
    slotId: "higgsfield-worldbuild",
    title: "Concept lab loop",
    tone: "violet" as const,
  },
  {
    badge: "Review wall",
    description: "Compare outputs, selects, and notes inside one structured review surface.",
    slotId: "review-select-wall",
    title: "Select comparison",
    tone: "emerald" as const,
  },
  {
    badge: "Handoff",
    description: "Structured asset memory that keeps exports, references, and thumbnails aligned.",
    slotId: "delivery-handoff",
    title: "Asset handoff board",
    tone: "cyan" as const,
  },
  {
    badge: "Control room",
    description: "A living dashboard for routing, generation, review, and final assembly.",
    slotId: "control-room-tour",
    title: "Studio command view",
    tone: "violet" as const,
  },
];

const workflowSteps = [
  {
    detail: "Capture the campaign, audience, offer, platforms, and creative objective before generation starts.",
    label: "Brief the campaign",
    step: "01",
  },
  {
    detail: "Break the idea into scenes, shots, prompts, references, and target aspect ratios.",
    label: "Structure the shot list",
    step: "02",
  },
  {
    detail: "Send hero polish to Sora 2, controlled motion to Kling, and exploratory passes to Higgsfield.",
    label: "Route by model strength",
    step: "03",
  },
  {
    detail: "Review, score, compare, and blend the best outputs into one stronger final video.",
    label: "Select and assemble",
    step: "04",
  },
];

const enterpriseSignals = [
  {
    label: "Private asset memory",
    value: "References, generations, thumbnails, and notes stay attached to the shot they belong to.",
  },
  {
    label: "Structured review loop",
    value: "Selections and rejections stay scored, comparable, and ready for downstream editing.",
  },
  {
    label: "Provider-safe architecture",
    value: "Credentials stay server-side, adapters stay isolated, and raw provider payloads stay backend-only.",
  },
  {
    label: "Team-grade workflow",
    value: "Campaigns, scenes, shots, assets, and approvals live inside one repeatable operating system.",
  },
];

const providerPlaybooks: Record<
  ProviderCatalogItem["id"],
  {
    badge: string;
    description: string;
    futureAssetPath: string;
    proof: string[];
    slotId: string;
    title: string;
    tone: "cyan" | "gold" | "violet";
  }
> = {
  higgsfield: {
    badge: "Creative exploration",
    description:
      "Use for experimentation, cinematic concepting, and stretching the visual language before locking a production-safe route.",
    futureAssetPath: "/media/brandbuild/higgsfield-concept-lab.mp4",
    proof: ["worldbuilding", "experimental transitions", "visual exploration"],
    slotId: "higgsfield-concept-lab",
    title: "Higgsfield expands the visual frontier",
    tone: "violet",
  },
  kling: {
    badge: "Motion control",
    description:
      "Use when the shot depends on natural body language, readable motion, character beats, or social-native pacing.",
    futureAssetPath: "/media/brandbuild/kling-performance-lab.mp4",
    proof: ["character motion", "dialogue-ready beats", "action-friendly pacing"],
    slotId: "kling-performance-lab",
    title: "Kling handles motion and performance",
    tone: "cyan",
  },
  sora: {
    badge: "Premium finish",
    description:
      "Use for polished hero moments, premium product composition, and the brand-critical shots that need finish and realism.",
    futureAssetPath: "/media/brandbuild/sora-hero-finish.mp4",
    proof: ["hero polish", "product realism", "brand-launch finish"],
    slotId: "sora-hero-finish",
    title: "Sora 2 owns the hero frame",
    tone: "gold",
  },
};

function providerStatus(provider: ProviderCatalogItem) {
  if (provider.integrationStage === "live" && provider.configured) {
    return "Live";
  }

  if (provider.integrationStage === "live") {
    return "Credential ready";
  }

  return "Exploration lane";
}

export function BrandbuildHomepage({ mode, providers }: BrandbuildHomepageProps) {
  return (
    <div className="relative overflow-hidden pb-20 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_top,rgba(120,146,255,0.22),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(72,212,255,0.14),transparent_20%),radial-gradient(circle_at_75%_18%,rgba(255,198,94,0.12),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[28rem] h-[48rem] bg-[linear-gradient(180deg,rgba(4,5,8,0)_0%,rgba(4,5,8,0.5)_26%,rgba(4,5,8,0.92)_100%)]" />

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="brandbuild-panel brandbuild-grid-mask relative overflow-hidden rounded-[40px] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(255,195,107,0.12),transparent_20%),radial-gradient(circle_at_30%_0%,rgba(100,193,255,0.12),transparent_24%)]" />

          <div className="relative grid gap-10 xl:grid-cols-[minmax(0,0.94fr)_minmax(420px,0.98fr)] xl:items-center">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="brandbuild-kicker">Enterprise AI video generation</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-white/72 uppercase">
                  {mode === "live" ? "Live workspace" : "Demo workspace"}
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-emerald-100 uppercase">
                  Multi-model routing active
                </span>
              </div>

              <div className="max-w-3xl space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.07em] text-white sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
                  Generate polished enterprise video by combining Sora 2, Kling, and Higgsfield through one control system.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                  BrandBuild is an enterprise AI video generation platform for serious teams. Use
                  Sora 2, Kling, and Higgsfield where each performs best, compare the outputs side
                  by side, and shape them into one stronger final production.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="brandbuild-primary-button" href="/login">
                  Start building
                </Link>
                <Link className="brandbuild-secondary-button" href="#control-room">
                  View control room
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Shot routing by strength",
                    value: "Choose the right engine per scene instead of forcing one model across the whole cut.",
                  },
                  {
                    label: "Side-by-side review",
                    value: "Compare hero polish, motion performance, and exploratory passes in one loop.",
                  },
                  {
                    label: "Campaign memory",
                    value: "Keep briefs, prompts, assets, notes, and approvals aligned from first prompt to handoff.",
                  },
                ].map((signal) => (
                  <div
                    className="rounded-[26px] border border-white/8 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    key={signal.label}
                  >
                    <p className="text-[11px] font-medium tracking-[0.18em] text-white/42 uppercase">
                      {signal.label}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/66">{signal.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[640px] xl:min-h-[680px]">
              <MediaFrame
                badge="Live creative session"
                className="h-[620px] sm:h-[660px]"
                description="An active orchestration surface for prompt building, run comparison, and select-ready output review."
                futureAssetPath="/media/brandbuild/hero-control-room.mp4"
                slotId="hero-control-room"
                title="Watch the studio operate instead of reading a brochure."
                tone="violet"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/10 bg-black/22 p-3">
                    <p className="text-[11px] font-medium tracking-[0.16em] text-white/44 uppercase">
                      Active run
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      Rooftop sip reveal routed through Kling for motion, then merged with Sora hero
                      polish.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/22 p-3">
                    <p className="text-[11px] font-medium tracking-[0.16em] text-white/44 uppercase">
                      Select state
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      2 selects approved, 1 exploratory pass held for concept reference.
                    </p>
                  </div>
                </div>
              </MediaFrame>

              <MediaFrame
                badge="Hero polish"
                className="absolute -left-2 top-8 h-[220px] w-[220px] rotate-[-6deg] shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:-left-6"
                description="Product launch finish, specular detail, and premium macro realism."
                futureAssetPath="/media/brandbuild/sora-hero-hover.mp4"
                slotId="sora-hero-hover"
                title="Sora hero pass"
                tone="gold"
              />

              <MediaFrame
                badge="Motion proof"
                className="absolute -right-2 bottom-[4.5rem] h-[230px] w-[240px] rotate-[6deg] shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:-right-6"
                description="Talent performance, natural movement, and readable social pacing."
                futureAssetPath="/media/brandbuild/kling-motion-hover.mp4"
                slotId="kling-motion-hover"
                title="Kling motion pass"
                tone="cyan"
              />

              <div className="brandbuild-panel absolute bottom-4 left-4 w-[min(90%,22rem)] rounded-[28px] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:left-8">
                <p className="text-[11px] font-medium tracking-[0.18em] text-white/42 uppercase">
                  Why it wins
                </p>
                <div className="mt-3 space-y-3">
                  {[
                    "Route premium brand frames to Sora 2.",
                    "Use Kling for readable motion and talent beats.",
                    "Keep Higgsfield available for cinematic exploration.",
                  ].map((item) => (
                    <div
                      className="rounded-2xl border border-white/8 bg-black/22 px-3 py-3 text-sm text-white/74"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <span className="brandbuild-kicker">Immediate visual proof</span>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              The product should feel like a live creative interface from the first fold.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/58">
            Video surfaces, review walls, orchestration strips, and active session previews carry the
            story. Copy stays short. Motion does the selling.
          </p>
        </div>

        <MediaMarquee items={marqueeItems} />
      </section>

      <section id="platform" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-5">
            <span className="brandbuild-kicker">Why multi-model wins</span>
            <h2 className="text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              One model is a lane. BrandBuild gives you the whole studio.
            </h2>
            <p className="max-w-md text-base leading-8 text-white/62">
              The best final video usually comes from model-specific strengths working together:
              polish from one, motion from another, exploration from a third, all organized in one
              structured workflow.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {providers.map((provider) => {
              const playbook = providerPlaybooks[provider.id];

              return (
                <div
                  className="brandbuild-panel h-full rounded-[32px] p-4 shadow-[0_26px_90px_rgba(0,0,0,0.34)]"
                  key={provider.id}
                >
                  <MediaFrame
                    badge={playbook.badge}
                    className="h-[280px]"
                    description={playbook.description}
                    futureAssetPath={playbook.futureAssetPath}
                    slotId={playbook.slotId}
                    title={playbook.title}
                    tone={playbook.tone}
                  />

                  <div className="mt-4 space-y-4 px-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium tracking-[0.18em] text-white/42 uppercase">
                          {provider.id}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
                          {provider.label}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-white/68 uppercase">
                        {providerStatus(provider)}
                      </span>
                    </div>

                    <p className="text-sm leading-7 text-white/62">{provider.fitSummary}</p>

                    <div className="flex flex-wrap gap-2">
                      {playbook.proof.map((item) => (
                        <span
                          className="rounded-full border border-white/8 bg-black/18 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-white/66 uppercase"
                          key={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
          <div className="space-y-5 xl:sticky xl:top-28">
            <span className="brandbuild-kicker">Workflow intelligence</span>
            <h2 className="text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              Choose the right engine for the right shot, then keep the whole pipeline connected.
            </h2>
            <p className="max-w-md text-base leading-8 text-white/62">
              BrandBuild turns the workflow into a system instead of a pile of prompts. Campaigns,
              scenes, shots, references, review notes, and outputs all stay mapped to the same
              operating surface.
            </p>

            <div className="space-y-3">
              {workflowSteps.map((step) => (
                <div
                  className="rounded-[28px] border border-white/8 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  key={step.step}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/22 text-sm font-semibold text-white">
                      {step.step}
                    </span>
                    <p className="text-lg font-semibold tracking-[-0.03em] text-white">{step.label}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/60">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="brandbuild-panel rounded-[36px] p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-3">
              {[
                {
                  label: "Campaign input",
                  lines: ["Audience and offer", "Platform targets", "Aspect ratios", "Brand constraints"],
                },
                {
                  label: "Model routing",
                  lines: ["Sora for hero polish", "Kling for motion", "Higgsfield for exploration", "Prompt versioning"],
                },
                {
                  label: "Review and handoff",
                  lines: ["Select scoring", "Asset sync", "Thumbnail memory", "Final assembly notes"],
                },
              ].map((column) => (
                <div
                  className="rounded-[30px] border border-white/8 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  key={column.label}
                >
                  <p className="text-[11px] font-medium tracking-[0.18em] text-white/42 uppercase">
                    {column.label}
                  </p>
                  <div className="mt-4 space-y-3">
                    {column.lines.map((line) => (
                      <div
                        className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3 text-sm text-white/74"
                        key={line}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)]">
              <MediaFrame
                badge="Pipeline preview"
                className="h-[340px]"
                description="A living strip for compares, selects, and provider-specific alternatives tied to the active shot."
                futureAssetPath="/media/brandbuild/workflow-compare-strip.mp4"
                slotId="workflow-compare-strip"
                title="Watch the compare wall evolve as each pass lands."
                tone="emerald"
              >
                <div className="grid gap-2 sm:grid-cols-3">
                  {["Hero finish", "Motion take", "Exploration alt"].map((item) => (
                    <div
                      className="rounded-2xl border border-white/8 bg-black/24 px-3 py-2 text-xs text-white/72"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </MediaFrame>

              <div className="rounded-[30px] border border-white/8 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <p className="text-[11px] font-medium tracking-[0.18em] text-white/42 uppercase">
                  Route logic
                </p>
                <div className="mt-4 space-y-4">
                  {[
                    {
                      engine: "Sora 2",
                      note: "Use when the frame carries premium product finish or brand-critical composition.",
                    },
                    {
                      engine: "Kling",
                      note: "Use when the shot depends on readable performance, controlled motion, or social-native energy.",
                    },
                    {
                      engine: "Higgsfield",
                      note: "Use when the idea needs creative expansion before the final route is locked.",
                    },
                  ].map((entry) => (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4" key={entry.engine}>
                      <p className="text-sm font-semibold text-white">{entry.engine}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">{entry.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="control-room" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl space-y-3">
            <span className="brandbuild-kicker">The dashboard is the product</span>
            <h2 className="text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              A control room for planning, generation, comparison, review, and final handoff.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/58">
            Less brochure. More cockpit. The product surface stays visually central because the
            workflow itself is the proof.
          </p>
        </div>

        <ControlRoomPreview mode={mode} providers={providers} />
      </section>

      <section id="enterprise" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="brandbuild-panel rounded-[38px] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
            <div className="space-y-5">
              <span className="brandbuild-kicker">Enterprise readiness</span>
              <h2 className="text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
                Built for repeatable creative operations, not one-off prompt experiments.
              </h2>
              <p className="max-w-xl text-base leading-8 text-white/62">
                Teams need a system for routing, assets, approvals, and iteration. BrandBuild makes
                the workflow repeatable so better output quality can scale with the work.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {enterpriseSignals.map((signal) => (
                  <div
                    className="rounded-[26px] border border-white/8 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    key={signal.label}
                  >
                    <p className="text-sm font-semibold text-white">{signal.label}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">{signal.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MediaFrame
                badge="Team review"
                className="h-[290px]"
                description="Scores, selects, and editability notes stay attached to the exact asset under review."
                futureAssetPath="/media/brandbuild/team-review-loop.mp4"
                slotId="team-review-loop"
                title="Structured select review"
                tone="emerald"
              />
              <MediaFrame
                badge="Asset memory"
                className="h-[290px]"
                description="Every pass, thumbnail, and export stays organized for a cleaner handoff to editing."
                futureAssetPath="/media/brandbuild/asset-memory-loop.mp4"
                slotId="asset-memory-loop"
                title="Private asset organization"
                tone="cyan"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="brandbuild-panel relative overflow-hidden rounded-[40px] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(93,148,255,0.2),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(255,199,92,0.14),transparent_18%),linear-gradient(125deg,rgba(13,16,24,0.96),rgba(7,9,14,0.9))]" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.75fr)] lg:items-center">
            <div className="space-y-5">
              <span className="brandbuild-kicker">Start the studio</span>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
                Build with the strengths of every model, then ship a better final video.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/62">
                BrandBuild is the AI video operating system for teams that want premium output,
                cleaner review, and multi-model control.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link className="brandbuild-primary-button" href="/login">
                  Enter dashboard
                </Link>
                <Link className="brandbuild-secondary-button" href="#platform">
                  Explore the workflow
                </Link>
              </div>
            </div>

            <MediaFrame
              badge="CTA loop"
              className="h-[320px]"
              description="This section is ready for a final branded motion montage once real launch footage is available."
              futureAssetPath="/media/brandbuild/cta-studio-loop.mp4"
              slotId="cta-studio-loop"
              title="Drop your launch montage here."
              tone="gold"
            >
              <div className="rounded-[22px] border border-white/10 bg-black/24 px-3 py-3 text-xs leading-6 text-white/72">
                Future insert: a 12 to 18 second loop that cuts between dashboard UI, model routing,
                product macro renders, and select-ready output comparisons.
              </div>
            </MediaFrame>
          </div>
        </div>
      </section>
    </div>
  );
}
