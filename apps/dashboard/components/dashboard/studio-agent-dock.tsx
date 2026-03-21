"use client";

import { useState } from "react";

import { StatusPill } from "@/components/studio/status-pill";
import { Button } from "@/components/ui/button";

type StudioAgentReply = {
  model: string;
  operatorNotes: string[];
  promptPatch: string[];
  recommendedActions: string[];
  routingDecision: "sora" | "kling" | "higgsfield" | null;
  source: "openai" | "fallback";
  summary: string;
  title: string;
};

const quickPrompts = [
  "Turn this brief into a step-by-step production plan.",
  "Which engine should handle this shot and why?",
  "Rewrite this ask so the operator can generate the next best run.",
];

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40";

export function StudioAgentDock() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StudioAgentReply | null>(null);

  async function submitQuery(nextQuery: string) {
    const trimmed = nextQuery.trim();

    if (!trimmed) {
      setError("Ask the studio agent a concrete question.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/studio", {
        body: JSON.stringify({ query: trimmed }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | (StudioAgentReply & { error?: string })
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to run the studio agent.");
      }

      setResult(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to run the studio agent.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,14,22,0.92),rgba(6,10,18,0.86))] p-4"
      id="studio-agent-dock"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label="Studio Agent" tone="info" />
            <StatusPill
              label={result?.source === "openai" ? "OpenAI live" : "Fallback ready"}
              tone={result?.source === "openai" ? "success" : "warning"}
            />
            {result?.model ? <StatusPill label={result.model} tone="default" /> : null}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Ask the agent to interpret the ask and guide the workflow
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Use the same workspace data, routing logic, and provider readiness the operators see
              in the dashboard so the next action feels clear, not manual.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium tracking-[0.14em] text-slate-300 uppercase transition hover:border-cyan-400/30 hover:text-white"
                key={prompt}
                onClick={() => {
                  setQuery(prompt);
                  void submitQuery(prompt);
                }}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full xl:max-w-[420px]">
          <label
            className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase"
            htmlFor="studio-agent-query"
          >
            Agent prompt
          </label>
          <textarea
            className={inputClassName}
            id="studio-agent-query"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask for routing advice, prompt refinements, or the next best operator move."
            rows={4}
            value={query}
          />
          <div className="mt-3 flex justify-end">
            <Button
              disabled={isLoading}
              onClick={() => {
                void submitQuery(query);
              }}
              type="button"
            >
              {isLoading ? "Thinking..." : "Ask agent"}
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[24px] border border-white/8 bg-black/16 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{result.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{result.summary}</p>
              </div>
              {result.routingDecision ? (
                <StatusPill label={`Route: ${result.routingDecision}`} tone="info" />
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Recommended actions
                </p>
                <div className="mt-3 grid gap-2">
                  {result.recommendedActions.map((item) => (
                    <div
                      className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3 text-sm text-slate-200"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Prompt patch
                </p>
                <div className="mt-3 grid gap-2">
                  {result.promptPatch.map((item) => (
                    <div
                      className="rounded-2xl border border-cyan-400/12 bg-cyan-400/6 px-3 py-3 text-sm text-cyan-50"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-black/16 p-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
              Operator notes
            </p>
            <div className="mt-3 grid gap-2">
              {result.operatorNotes.map((item) => (
                <div
                  className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3 text-sm leading-6 text-slate-300"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
