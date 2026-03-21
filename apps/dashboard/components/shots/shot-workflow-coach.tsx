import { Panel } from "@/components/studio/panel";
import { StatusPill } from "@/components/studio/status-pill";
import { ButtonLink } from "@/components/ui/button";
import type {
  Asset,
  Review,
  RoutingRecommendation,
  Shot,
  ShotGeneration,
} from "@/lib/studio/types";
import { cx } from "@/lib/utils";

type ShotWorkflowCoachProps = {
  campaignId: string;
  generations: ShotGeneration[];
  reviewRecords: Review[];
  routingRecommendation: RoutingRecommendation;
  shot: Shot;
  shotAssets: Asset[];
  supportAssetCount: number;
};

type WorkflowStep = {
  complete: boolean;
  detail: string;
  key:
    | "brief"
    | "references"
    | "prompt"
    | "routing"
    | "generate"
    | "review";
  title: string;
};

const referenceAssetTypes = new Set([
  "reference_image",
  "reference_video",
  "product_image",
  "character_sheet",
  "moodboard",
  "logo",
]);

function getStepTone(state: "complete" | "current" | "up-next") {
  switch (state) {
    case "complete":
      return "border-emerald-400/24 bg-emerald-400/10 text-emerald-50";
    case "current":
      return "border-cyan-400/30 bg-cyan-400/10 text-white";
    default:
      return "border-white/8 bg-white/4 text-slate-300";
  }
}

function getWorkflowLinks(step: WorkflowStep, campaignId: string) {
  switch (step.key) {
    case "brief":
      return [
        { href: "#shot-setup", label: "Open shot setup" },
        { href: `/dashboard/campaigns/${campaignId}`, label: "Review campaign brief" },
      ];
    case "references":
      return [
        { href: "#associated-assets", label: "Review references" },
        { href: "/dashboard/assets", label: "Open asset library" },
      ];
    case "prompt":
      return [
        { href: "#creative-direction", label: "Shape prompt fields" },
        { href: "#final-prompt-stage", label: "Compose final prompt" },
      ];
    case "routing":
      return [
        { href: "#routing-stage", label: "Confirm engine routing" },
        { href: "#studio-agent-dock", label: "Ask the Studio Agent" },
      ];
    case "generate":
      return [
        { href: "#generate-stage", label: "Launch run" },
        { href: "#tag-discovery-dock", label: "Clarify the ask first" },
      ];
    case "review":
      return [
        { href: "#review-panel", label: "Score outputs" },
        { href: "/dashboard/reviews", label: "Open review queue" },
      ];
  }
}

export function ShotWorkflowCoach({
  campaignId,
  generations,
  reviewRecords,
  routingRecommendation,
  shot,
  shotAssets,
  supportAssetCount,
}: ShotWorkflowCoachProps) {
  const hasBrief = shot.title.trim().length > 0 && shot.purpose.trim().length > 0;
  const hasReferences =
    shotAssets.some((asset) => referenceAssetTypes.has(asset.type)) || supportAssetCount > 0;
  const hasStructuredPrompt =
    shot.promptText.trim().length >= 120 &&
    shot.promptStructure.subject.trim().length > 0 &&
    shot.promptStructure.action.trim().length > 0;
  const hasRun = generations.length > 0;
  const hasReview = reviewRecords.length > 0;

  const steps: WorkflowStep[] = [
    {
      complete: hasBrief,
      detail: "Lock the production intent first so the model choice stays attached to a real shot goal.",
      key: "brief",
      title: "Brief the shot",
    },
    {
      complete: hasReferences,
      detail: "Attach or confirm reference assets so motion and style decisions stay grounded.",
      key: "references",
      title: "Gather references",
    },
    {
      complete: hasStructuredPrompt,
      detail: "Translate the ask into subject, action, camera, environment, lighting, mood, and constraints.",
      key: "prompt",
      title: "Structure the prompt",
    },
    {
      complete: shot.targetModel === routingRecommendation.model,
      detail: `Current recommendation: ${routingRecommendation.model}. ${routingRecommendation.fitSummary}`,
      key: "routing",
      title: "Confirm the best engine",
    },
    {
      complete: hasRun,
      detail: "Generate at least one tracked run so the team can compare outputs instead of debating hypotheticals.",
      key: "generate",
      title: "Generate and compare",
    },
    {
      complete: hasReview,
      detail: "Review the output, score it, and select the strongest asset for edit handoff.",
      key: "review",
      title: "Review and hand off",
    },
  ];

  const currentIndex = steps.findIndex((step) => !step.complete);
  const activeIndex = currentIndex === -1 ? steps.length - 1 : currentIndex;
  const activeStep = steps[activeIndex];
  const selectedCount = reviewRecords.filter((review) => review.decision === "selected").length;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
      <Panel className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Guided workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Follow one clear production path for this shot
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              The portal should make Sora, Kling, and Higgsfield feel like one orchestrated system.
              This rail shows what is already done, what is next, and where the operator should go
              instead of forcing them to remember the process.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusPill
              label={selectedCount > 0 ? `${selectedCount} selects ready` : "Selection pending"}
              tone={selectedCount > 0 ? "success" : "warning"}
            />
            <StatusPill label={`Recommended: ${routingRecommendation.model}`} tone="info" />
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {steps.map((step, index) => {
            const state =
              index < activeIndex ? "complete" : index === activeIndex ? "current" : "up-next";

            return (
              <div
                className={cx(
                  "rounded-[24px] border px-4 py-4 transition",
                  getStepTone(state),
                )}
                key={step.key}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-500">
                      Step {index + 1}
                    </p>
                    <p className="mt-2 text-lg font-semibold">{step.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{step.detail}</p>
                  </div>
                  <StatusPill
                    label={
                      state === "complete"
                        ? "Done"
                        : state === "current"
                          ? "Current focus"
                          : "Up next"
                    }
                    tone={
                      state === "complete"
                        ? "success"
                        : state === "current"
                          ? "info"
                          : "default"
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="p-6">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Workflow coach
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{activeStep.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{activeStep.detail}</p>

        <div className="mt-5 rounded-[24px] border border-white/8 bg-black/14 p-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
            Generator blend
          </p>
          <div className="mt-4 grid gap-3">
            {[
              {
                detail: "Use for the glossy hero pass and polished campaign finish.",
                label: "Sora",
                matches: routingRecommendation.model === "sora",
              },
              {
                detail: "Use for readable motion, people, action beats, and performance shots.",
                label: "Kling",
                matches: routingRecommendation.model === "kling",
              },
              {
                detail: "Use for exploratory cinematic motion and concept expansion.",
                label: "Higgsfield",
                matches: routingRecommendation.model === "higgsfield",
              },
            ].map((provider) => (
              <div
                className={cx(
                  "rounded-[20px] border px-4 py-4",
                  provider.matches
                    ? "border-cyan-400/24 bg-cyan-400/10"
                    : "border-white/8 bg-white/4",
                )}
                key={provider.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{provider.label}</p>
                  {provider.matches ? (
                    <StatusPill label="Best fit now" tone="info" />
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{provider.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {getWorkflowLinks(activeStep, campaignId).map((link) => (
            <ButtonLink href={link.href} key={link.href} size="md" variant="secondary">
              {link.label}
            </ButtonLink>
          ))}
        </div>
      </Panel>
    </section>
  );
}
