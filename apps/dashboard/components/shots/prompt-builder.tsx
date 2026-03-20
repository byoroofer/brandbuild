"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  initialStudioActionState,
  saveShotPromptAction,
} from "@/app/actions/studio";
import { StatusPill } from "@/components/studio/status-pill";
import { Button } from "@/components/ui/button";
import type {
  PromptTemplate,
  RoutingRecommendation,
  Shot,
  ShotGeneration,
  TagDiscoveryTag,
  WorkspaceMode,
} from "@/lib/studio/types";
import {
  appendTagSignalsToPrompt,
  mergeTagDiscoveryNotes,
  parseTagDiscoveryNotes,
} from "@/lib/utils/tag-discovery";
import { applyPromptTemplate, composeStructuredPrompt } from "@/lib/utils/prompts";

type PromptBuilderProps = {
  generations: ShotGeneration[];
  mode: WorkspaceMode;
  persistenceEnabled: boolean;
  promptTemplates: PromptTemplate[];
  routingRecommendation: RoutingRecommendation;
  shot: Shot;
};

type ApplyTagDiscoveryEvent = CustomEvent<{
  tags: TagDiscoveryTag[];
}>;

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40";

function mergeUniqueTags(currentTags: TagDiscoveryTag[], incomingTags: TagDiscoveryTag[]) {
  const merged = new Map<string, TagDiscoveryTag>();

  for (const tag of [...currentTags, ...incomingTags]) {
    const key = tag.label.trim().toLowerCase();

    if (!key) {
      continue;
    }

    if (!merged.has(key)) {
      merged.set(key, tag);
    }
  }

  return [...merged.values()];
}

export function PromptBuilder({
  generations,
  mode,
  persistenceEnabled,
  promptTemplates,
  routingRecommendation,
  shot,
}: PromptBuilderProps) {
  const router = useRouter();
  const [state, formAction, isSaving] = useActionState(
    saveShotPromptAction,
    initialStudioActionState,
  );
  const [isGenerating, startRefresh] = useTransition();
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);
  const [refreshingGenerationId, setRefreshingGenerationId] = useState<string | null>(null);

  const parsedNotes = useMemo(() => parseTagDiscoveryNotes(shot.notes), [shot.notes]);

  const [title, setTitle] = useState(shot.title);
  const [purpose, setPurpose] = useState(shot.purpose);
  const [durationSeconds, setDurationSeconds] = useState(String(shot.durationSeconds));
  const [subject, setSubject] = useState(shot.promptStructure.subject);
  const [action, setAction] = useState(shot.promptStructure.action);
  const [camera, setCamera] = useState(shot.promptStructure.camera);
  const [environment, setEnvironment] = useState(shot.promptStructure.environment);
  const [lighting, setLighting] = useState(shot.promptStructure.lighting);
  const [mood, setMood] = useState(shot.promptStructure.mood);
  const [visualStyle, setVisualStyle] = useState(shot.promptStructure.visualStyle);
  const [dialogueAudioIntent, setDialogueAudioIntent] = useState(
    shot.promptStructure.dialogueAudioIntent,
  );
  const [constraints, setConstraints] = useState(shot.promptStructure.constraints);
  const [notes, setNotes] = useState(parsedNotes.freeformNotes);
  const [appliedTags, setAppliedTags] = useState<TagDiscoveryTag[]>(parsedNotes.tags);
  const [tagApplicationMessage, setTagApplicationMessage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(shot.aspectRatio);
  const [targetModel, setTargetModel] = useState(shot.targetModel);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const combinedNotes = useMemo(
    () => mergeTagDiscoveryNotes(notes, appliedTags),
    [appliedTags, notes],
  );

  const currentPromptFields = useMemo(
    () => ({
      action,
      camera,
      constraints,
      dialogueAudioIntent,
      environment,
      lighting,
      mood,
      subject,
      visualStyle,
    }),
    [
      action,
      camera,
      constraints,
      dialogueAudioIntent,
      environment,
      lighting,
      mood,
      subject,
      visualStyle,
    ],
  );

  const defaultComposedPrompt = useMemo(
    () => composeStructuredPrompt(currentPromptFields),
    [currentPromptFields],
  );

  const taggedDefaultPrompt = useMemo(
    () => appendTagSignalsToPrompt(defaultComposedPrompt, appliedTags),
    [appliedTags, defaultComposedPrompt],
  );

  const initialPromptText = appendTagSignalsToPrompt(shot.promptText, parsedNotes.tags);
  const [promptText, setPromptText] = useState(initialPromptText);
  const [promptOverrideEnabled, setPromptOverrideEnabled] = useState(
    initialPromptText.trim() !== taggedDefaultPrompt.trim(),
  );

  useEffect(() => {
    if (promptOverrideEnabled) {
      return;
    }

    if (selectedTemplateId) {
      const template = promptTemplates.find((entry) => entry.id === selectedTemplateId);

      if (template?.finalTemplate) {
        setPromptText(
          appendTagSignalsToPrompt(
            applyPromptTemplate(template.finalTemplate, currentPromptFields),
            appliedTags,
          ),
        );
        return;
      }
    }

    setPromptText(taggedDefaultPrompt);
  }, [
    appliedTags,
    currentPromptFields,
    promptOverrideEnabled,
    promptTemplates,
    selectedTemplateId,
    taggedDefaultPrompt,
  ]);

  useEffect(() => {
    function handleApplyTagEvent(event: Event) {
      const detail = (event as ApplyTagDiscoveryEvent).detail;
      const incomingTags = Array.isArray(detail?.tags) ? detail.tags : [];

      if (incomingTags.length === 0) {
        return;
      }

      setTagApplicationMessage(
        incomingTags.length === 1
          ? `Applied ${incomingTags[0]?.label ?? "discovery tag"} to this shot draft.`
          : `Applied ${incomingTags.length} discovery tags to this shot draft.`,
      );
      setAppliedTags((current) => mergeUniqueTags(current, incomingTags));
    }

    window.addEventListener("studio:apply-tag-discovery", handleApplyTagEvent);

    return () => {
      window.removeEventListener("studio:apply-tag-discovery", handleApplyTagEvent);
    };
  }, []);

  function refreshPromptText() {
    if (selectedTemplateId) {
      const template = promptTemplates.find((entry) => entry.id === selectedTemplateId);

      if (template?.finalTemplate) {
        setPromptText(
          appendTagSignalsToPrompt(
            applyPromptTemplate(template.finalTemplate, currentPromptFields),
            appliedTags,
          ),
        );
        setPromptOverrideEnabled(false);
        return;
      }
    }

    setPromptText(taggedDefaultPrompt);
    setPromptOverrideEnabled(false);
  }

  function applyTemplate(template: PromptTemplate) {
    const composed = template.finalTemplate
      ? applyPromptTemplate(template.finalTemplate, currentPromptFields)
      : defaultComposedPrompt;

    setSelectedTemplateId(template.id);
    setPromptText(
      appendTagSignalsToPrompt(
        composed.trim().length > 0 ? composed : defaultComposedPrompt,
        appliedTags,
      ),
    );
    setPromptOverrideEnabled(false);
  }

  function removeAppliedTag(label: string) {
    setAppliedTags((current) =>
      current.filter((tag) => tag.label.toLowerCase() !== label.toLowerCase()),
    );
    setTagApplicationMessage(`Removed ${label} from this shot draft.`);
  }

  async function handleGenerate() {
    setGenerationError(null);
    setGenerationSuccess(null);

    if (!persistenceEnabled) {
      setGenerationError(
        "Supabase operator access is not configured yet, so generation requests are unavailable in this environment.",
      );
      return;
    }

    if (targetModel === "sora" && aspectRatio === "1:1") {
      setGenerationError(
        "The live Sora path in this workspace currently supports 16:9 and 9:16 only. Switch the aspect ratio or route this shot to another provider.",
      );
      return;
    }

    const response = await fetch("/api/generate", {
      body: JSON.stringify({
        action,
        aspectRatio,
        camera,
        constraints,
        dialogueAudioIntent,
        durationSeconds,
        environment,
        lighting,
        mood,
        notes: combinedNotes,
        promptText,
        purpose,
        shotId: shot.id,
        subject,
        targetModel,
        title,
        visualStyle,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          integrationMode?: "live" | "mock";
          outputUrl?: string | null;
          provider?: string;
          status?: string;
          syncedAssetsCount?: number;
          thumbnailUrl?: string | null;
        }
      | null;

    if (!response.ok) {
      setGenerationError(payload?.error ?? "Unable to trigger generation.");
      return;
    }

    setGenerationSuccess(
      payload?.integrationMode === "live"
        ? `Live ${payload?.provider ?? targetModel} render requested with ${payload?.status ?? "queued"} status.${payload?.syncedAssetsCount ? ` ${payload.syncedAssetsCount} asset${payload.syncedAssetsCount === 1 ? "" : "s"} synced to the library.` : ""}`
        : `Mock ${payload?.provider ?? targetModel} generation recorded with ${payload?.status ?? "mocked"} status.`,
    );

    startRefresh(() => {
      router.refresh();
    });
  }

  async function handleRefreshGeneration(generationId: string) {
    setGenerationError(null);
    setGenerationSuccess(null);
    setRefreshingGenerationId(generationId);

    try {
      const response = await fetch(`/api/generate/${generationId}`, {
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            integrationMode?: "live" | "mock";
            outputUrl?: string | null;
            progress?: number | null;
            provider?: string;
            providerStatus?: string;
            status?: string;
            syncedAssetsCount?: number;
            thumbnailUrl?: string | null;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to refresh generation status.");
      }

      setGenerationSuccess(
        payload?.integrationMode === "live"
          ? `Live ${payload?.provider ?? "provider"} status synced: ${payload?.providerStatus ?? payload?.status ?? "queued"}${typeof payload?.progress === "number" ? ` (${payload.progress}%)` : ""}.${payload?.syncedAssetsCount ? ` ${payload.syncedAssetsCount} asset${payload.syncedAssetsCount === 1 ? "" : "s"} synced to the library.` : ""}`
          : `Mock ${payload?.provider ?? "provider"} status refreshed.`,
      );

      startRefresh(() => {
        router.refresh();
      });
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Unable to refresh generation status.",
      );
    } finally {
      setRefreshingGenerationId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
      <div className="app-shell rounded-[30px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Prompt builder
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{shot.title}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Edit shot metadata, refine the structured prompt sections, then launch a provider run
              through the studio router.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusPill
              label={mode === "live" ? "Live mode" : "Demo mode"}
              tone={mode === "live" ? "success" : "warning"}
            />
            <StatusPill status={shot.status} />
          </div>
        </div>

        <form action={formAction} className="mt-8 grid gap-4">
          <input name="shotId" type="hidden" value={shot.id} />
          <input name="notes" type="hidden" value={combinedNotes} />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_220px_180px]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Shot title</label>
              <input
                className={fieldClassName}
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Duration (seconds)</label>
              <input
                className={fieldClassName}
                min={1}
                name="durationSeconds"
                onChange={(event) => setDurationSeconds(event.target.value)}
                step={1}
                type="number"
                value={durationSeconds}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Aspect ratio</label>
              <select
                className={fieldClassName}
                name="aspectRatio"
                onChange={(event) => setAspectRatio(event.target.value)}
                value={aspectRatio}
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Shot purpose</label>
            <textarea
              className={fieldClassName}
              name="purpose"
              onChange={(event) => setPurpose(event.target.value)}
              rows={3}
              value={purpose}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Subject</label>
              <textarea
                className={fieldClassName}
                name="subject"
                onChange={(event) => setSubject(event.target.value)}
                rows={3}
                value={subject}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Action</label>
              <textarea
                className={fieldClassName}
                name="action"
                onChange={(event) => setAction(event.target.value)}
                rows={3}
                value={action}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Camera</label>
              <textarea
                className={fieldClassName}
                name="camera"
                onChange={(event) => setCamera(event.target.value)}
                rows={3}
                value={camera}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Environment</label>
              <textarea
                className={fieldClassName}
                name="environment"
                onChange={(event) => setEnvironment(event.target.value)}
                rows={3}
                value={environment}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Lighting</label>
              <textarea
                className={fieldClassName}
                name="lighting"
                onChange={(event) => setLighting(event.target.value)}
                rows={3}
                value={lighting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Mood</label>
              <textarea
                className={fieldClassName}
                name="mood"
                onChange={(event) => setMood(event.target.value)}
                rows={3}
                value={mood}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Visual style</label>
              <textarea
                className={fieldClassName}
                name="visualStyle"
                onChange={(event) => setVisualStyle(event.target.value)}
                rows={3}
                value={visualStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Dialogue / audio intent</label>
              <textarea
                className={fieldClassName}
                name="dialogueAudioIntent"
                onChange={(event) => setDialogueAudioIntent(event.target.value)}
                rows={3}
                value={dialogueAudioIntent}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Constraints</label>
              <textarea
                className={fieldClassName}
                name="constraints"
                onChange={(event) => setConstraints(event.target.value)}
                rows={3}
                value={constraints}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Target model</label>
              <select
                className={fieldClassName}
                name="targetModel"
                onChange={(event) => setTargetModel(event.target.value as Shot["targetModel"])}
                value={targetModel}
              >
                <option value="sora">OpenAI Sora 2</option>
                <option value="kling">Kling</option>
                <option value="higgsfield">Higgsfield</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 rounded-[28px] border border-white/8 bg-black/16 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Applied discovery tags</p>
                <p className="mt-1 text-sm text-slate-400">
                  Tags from the command bar can be folded into the prompt and persisted with this
                  shot draft.
                </p>
              </div>
              <StatusPill label={`${appliedTags.length} tags`} tone="info" />
            </div>

            {appliedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {appliedTags.map((tag) => (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-2 text-xs font-semibold tracking-[0.14em] text-cyan-50 uppercase transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-50"
                    key={tag.label}
                    onClick={() => removeAppliedTag(tag.label)}
                    type="button"
                  >
                    <span>{tag.label}</span>
                    <span className="text-[10px] text-cyan-200/70">remove</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-4 text-sm leading-6 text-slate-400">
                Run tag discovery in the command bar above, then apply one tag or the full pack to
                this shot draft.
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-[28px] border border-white/8 bg-black/16 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Final composed prompt</p>
                <p className="mt-1 text-sm text-slate-400">
                  Structured fields auto-sync the final prompt unless you intentionally turn on a
                  manual override.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setPromptOverrideEnabled((value) => !value);
                  }}
                  type="button"
                  variant="secondary"
                >
                  {promptOverrideEnabled ? "Disable manual override" : "Enable manual override"}
                </Button>
                <Button onClick={refreshPromptText} type="button" variant="secondary">
                  Recompose prompt
                </Button>
              </div>
            </div>

            <textarea
              className={fieldClassName}
              name="promptText"
              onChange={(event) => {
                setPromptText(event.target.value);
                if (!promptOverrideEnabled) {
                  setPromptOverrideEnabled(true);
                }
              }}
              rows={10}
              value={promptText}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Generation notes</label>
            <textarea
              className={fieldClassName}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              value={notes}
            />
            <p className="text-xs leading-5 text-slate-500">
              Applied discovery tags are saved automatically with the shot draft and generation run.
            </p>
          </div>

          {!persistenceEnabled ? (
            <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Demo mode is active. Connect Supabase and sign in as an operator to save prompt edits
              and record generation requests.
            </p>
          ) : null}

          {persistenceEnabled && targetModel === "sora" && aspectRatio === "1:1" ? (
            <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              The live Sora integration currently supports `16:9` and `9:16` only in this
              workspace. Route square shots to another provider for now.
            </p>
          ) : null}

          {tagApplicationMessage ? (
            <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              {tagApplicationMessage}
            </p>
          ) : null}

          {state.error ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {state.error}
            </p>
          ) : null}

          {state.success ? (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {state.success}
            </p>
          ) : null}

          {generationError ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {generationError}
            </p>
          ) : null}

          {generationSuccess ? (
            <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              {generationSuccess}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={!persistenceEnabled || isSaving} type="submit" variant="secondary">
              {isSaving ? "Saving..." : "Save prompt draft"}
            </Button>
            <Button
              disabled={!persistenceEnabled || isGenerating || isSaving}
              onClick={handleGenerate}
              type="button"
            >
              {isGenerating ? "Generating..." : "Generate run"}
            </Button>
          </div>
        </form>
      </div>

      <div className="grid gap-6">
        <div className="app-shell rounded-[30px] p-6">
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Model routing
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{routingRecommendation.model}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{routingRecommendation.fitSummary}</p>
          <p className="mt-4 text-sm leading-6 text-slate-400">{routingRecommendation.rationale}</p>
        </div>

        <div className="app-shell rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Prompt templates
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use studio templates as a composition scaffold, then keep refining the structured
                fields for this shot.
              </p>
            </div>
            <StatusPill label={`${promptTemplates.length} templates`} tone="info" />
          </div>

          <div className="mt-5 grid gap-3">
            {promptTemplates.map((template) => (
              <div className="rounded-[24px] border border-white/8 bg-black/14 p-4" key={template.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{template.name}</p>
                    <p className="mt-1 text-xs tracking-[0.14em] text-slate-500 uppercase">
                      {template.category}
                      {template.targetModel ? ` / ${template.targetModel}` : ""}
                    </p>
                  </div>
                  <Button
                    onClick={() => applyTemplate(template)}
                    size="md"
                    type="button"
                    variant="secondary"
                  >
                    Use
                  </Button>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="app-shell rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Generation history
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Studio generation requests recorded for this shot.
              </p>
            </div>
            <StatusPill label={`${generations.length} runs`} tone="default" />
          </div>

          <div className="mt-5 grid gap-3">
            {generations.map((generation) => (
              <div className="rounded-[24px] border border-white/8 bg-black/14 p-4" key={generation.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{generation.provider}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(generation.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <StatusPill
                      label={generation.integrationMode === "live" ? "Live" : "Mock"}
                      tone={generation.integrationMode === "live" ? "success" : "warning"}
                    />
                    <StatusPill status={generation.status} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{generation.generationNotes}</p>
                {generation.providerStatus ? (
                  <p className="mt-3 text-xs tracking-[0.14em] text-slate-500 uppercase">
                    Provider status: {generation.providerStatus}
                  </p>
                ) : null}
                {typeof generation.progress === "number" ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs tracking-[0.14em] text-slate-500 uppercase">
                      <span>Progress</span>
                      <span>{generation.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
                        style={{ width: `${Math.max(0, Math.min(100, generation.progress))}%` }}
                      />
                    </div>
                  </div>
                ) : null}
                {generation.providerMessage ? (
                  <p className="mt-3 text-sm leading-6 text-slate-400">{generation.providerMessage}</p>
                ) : null}
                {generation.outputUrl || generation.thumbnailUrl ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {generation.outputUrl ? (
                      <a
                        className="inline-flex items-center justify-center rounded-full border border-cyan-400/18 bg-cyan-400/10 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-cyan-50 uppercase transition hover:border-cyan-300/40 hover:bg-cyan-400/14"
                        href={generation.outputUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open output
                      </a>
                    ) : null}
                    {generation.thumbnailUrl ? (
                      <a
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-slate-200 uppercase transition hover:border-white/16 hover:bg-white/8"
                        href={generation.thumbnailUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open thumbnail
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {generation.integrationMode === "live" ? (
                  <div className="mt-4 flex justify-end">
                    <Button
                      disabled={refreshingGenerationId === generation.id || isGenerating || isSaving}
                      onClick={() => handleRefreshGeneration(generation.id)}
                      size="md"
                      type="button"
                      variant="secondary"
                    >
                      {refreshingGenerationId === generation.id ? "Refreshing..." : "Refresh status"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}

            {generations.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/14 p-6 text-sm leading-6 text-slate-400">
                No generation runs are logged yet. Save the prompt draft, then trigger a provider
                run to create the first `shot_generations` record.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
