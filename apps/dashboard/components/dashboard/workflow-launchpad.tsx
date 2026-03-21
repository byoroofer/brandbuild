"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StatusPill } from "@/components/studio/status-pill";
import { Button, ButtonLink } from "@/components/ui/button";
import type { WorkspaceMode } from "@/lib/studio/types";
import { cx } from "@/lib/utils";

type WorkflowLaunchpadProps = {
  mode: WorkspaceMode;
};

type WorkflowStep = {
  ctaHref: string;
  ctaLabel: string;
  detail: string;
  hint: string;
  title: string;
};

const dismissedStorageKey = "brandbuild-workflow-launchpad-dismissed-v1";

const workflowSteps: WorkflowStep[] = [
  {
    ctaHref: "/dashboard/campaigns?compose=new",
    ctaLabel: "Start a campaign",
    detail:
      "Capture the brief, objective, audience, and platforms first so every generator run stays anchored to the same production goal.",
    hint: "Keep the brief short and decisive. One campaign should represent one real production outcome.",
    title: "1. Lock the brief",
  },
  {
    ctaHref: "#tag-discovery-dock",
    ctaLabel: "Open discovery",
    detail:
      "Use typed notes or a quick voice memo to translate the creative ask into reference signals, tags, and clearer visual direction.",
    hint: "This is where operators say what they want in plain English before we structure it for the generators.",
    title: "2. Clarify intent",
  },
  {
    ctaHref: "#studio-agent-dock",
    ctaLabel: "Ask the agent",
    detail:
      "Let the Studio Agent interpret the ask, recommend the best engine, and suggest prompt changes before anyone generates a run.",
    hint: "Sora for premium hero polish, Kling for readable motion and performance, Higgsfield for exploratory cinematic passes.",
    title: "3. Route the right engine",
  },
  {
    ctaHref: "/dashboard/shots",
    ctaLabel: "Open shot queue",
    detail:
      "Work one shot at a time in a guided sequence: metadata, prompt structure, engine choice, generation, then review.",
    hint: "Operators should never have to wonder which field matters next.",
    title: "4. Generate in sequence",
  },
  {
    ctaHref: "/dashboard/reviews",
    ctaLabel: "Review outputs",
    detail:
      "Compare results, select the strongest output, and move the chosen asset forward to edit handoff instead of bouncing between tools.",
    hint: "This is the seam that makes three generators feel like one portal.",
    title: "5. Review and hand off",
  },
];

function getStepCardTone(index: number, activeIndex: number) {
  if (index < activeIndex) {
    return "border-emerald-400/24 bg-emerald-400/10 text-emerald-50";
  }

  if (index === activeIndex) {
    return "border-cyan-400/28 bg-cyan-400/10 text-white";
  }

  return "border-white/8 bg-white/4 text-slate-200";
}

export function WorkflowLaunchpad({ mode }: WorkflowLaunchpadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(dismissedStorageKey)) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const activeStep = workflowSteps[activeStepIndex] ?? workflowSteps[0];

  function dismissModal() {
    try {
      window.localStorage.setItem(dismissedStorageKey, "dismissed");
    } catch {
      // Ignore storage failures and just close the modal.
    }

    setIsOpen(false);
  }

  return (
    <>
      <div
        className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(12,18,28,0.96),rgba(7,11,18,0.9))] p-5"
        id="workflow-launchpad"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label="Guided workflow" tone="success" />
              <StatusPill
                label={mode === "live" ? "Live operators" : "Demo operators"}
                tone={mode === "live" ? "info" : "warning"}
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                Turn three generators into one clean production flow.
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                BrandBuild should feel like a guided studio cockpit, not a pile of model controls.
                Start with intent, let the portal recommend the best engine, then move one shot at
                a time through generation and review.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsOpen(true)} type="button" variant="secondary">
              Open walkthrough
            </Button>
            <ButtonLink href="/dashboard/shots" size="md">
              Guided shot queue
            </ButtonLink>
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-5">
          {workflowSteps.map((step, index) => (
            <button
              className={cx(
                "rounded-[24px] border px-4 py-4 text-left transition hover:border-cyan-400/24 hover:text-white",
                getStepCardTone(index, activeStepIndex),
              )}
              key={step.title}
              onClick={() => setActiveStepIndex(index)}
              type="button"
            >
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{step.detail}</p>
            </button>
          ))}
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 px-4 py-8 backdrop-blur-md">
          <div
            aria-labelledby="workflow-launchpad-title"
            aria-modal="true"
            className="app-shell w-full max-w-5xl rounded-[34px] p-6 sm:p-8"
            role="dialog"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill label="Workflow walkthrough" tone="info" />
                    <StatusPill
                      label={`${activeStepIndex + 1} of ${workflowSteps.length}`}
                      tone="default"
                    />
                  </div>
                  <div>
                    <h2
                      className="text-3xl font-semibold text-white sm:text-4xl"
                      id="workflow-launchpad-title"
                    >
                      Make multi-model video production feel guided.
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                      This portal should help operators decide what to make, which generator to
                      use, and what to do next without needing to mentally stitch the workflow
                      together themselves.
                    </p>
                  </div>
                </div>

                <button
                  className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                  onClick={dismissModal}
                  type="button"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="grid gap-3">
                  {workflowSteps.map((step, index) => (
                    <button
                      className={cx(
                        "rounded-[24px] border px-4 py-4 text-left transition",
                        index === activeStepIndex
                          ? "border-cyan-400/30 bg-cyan-400/10 text-white"
                          : index < activeStepIndex
                            ? "border-emerald-400/22 bg-emerald-400/8 text-emerald-50"
                            : "border-white/8 bg-white/4 text-slate-300 hover:border-white/16 hover:text-white",
                      )}
                      key={step.title}
                      onClick={() => setActiveStepIndex(index)}
                      type="button"
                    >
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{step.hint}</p>
                    </button>
                  ))}
                </div>

                <div className="rounded-[28px] border border-white/8 bg-black/16 p-6">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                    Current step
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold text-white">{activeStep.title}</h3>
                  <p className="mt-4 text-base leading-8 text-slate-300">{activeStep.detail}</p>

                  <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                      Operator hint
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{activeStep.hint}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      className="inline-flex h-11 items-center justify-center rounded-full border border-blue-600 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-5 text-sm font-medium text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5"
                      href={activeStep.ctaHref}
                      onClick={dismissModal}
                    >
                      {activeStep.ctaLabel}
                    </Link>
                    <Button
                      onClick={() =>
                        setActiveStepIndex((current) =>
                          Math.min(current + 1, workflowSteps.length - 1),
                        )
                      }
                      type="button"
                      variant="secondary"
                    >
                      Next step
                    </Button>
                    {activeStepIndex > 0 ? (
                      <Button
                        onClick={() =>
                          setActiveStepIndex((current) => Math.max(current - 1, 0))
                        }
                        type="button"
                        variant="ghost"
                      >
                        Back
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
