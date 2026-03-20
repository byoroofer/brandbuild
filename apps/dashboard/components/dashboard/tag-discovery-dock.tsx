"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { StatusPill } from "@/components/studio/status-pill";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/utils";
import type {
  TagDiscoveryPlatform,
  TagDiscoveryResult,
  TagDiscoveryTag,
  TagTrendSignal,
} from "@/lib/studio/types";

const quickBriefs = [
  "Premium product launch angles for a new citrus energy drink on TikTok and Instagram.",
  "Short-form tags for a cinematic SaaS launch with founder-led storytelling.",
  "Current creator-style hooks for a beauty demo campaign on Reels and Shorts.",
];

const platformOptions: Array<{
  description: string;
  label: string;
  value: TagDiscoveryPlatform;
}> = [
  {
    description: "Polished short-form lifestyle and premium reel language.",
    label: "Instagram",
    value: "instagram",
  },
  {
    description: "Fast hook-first creator formats and native short-form language.",
    label: "TikTok",
    value: "tiktok",
  },
  {
    description: "Retention-oriented short-form video framing.",
    label: "YouTube Shorts",
    value: "youtube-shorts",
  },
  {
    description: "Paid social and conversion-minded creative angles.",
    label: "Meta Ads",
    value: "meta-ads",
  },
  {
    description: "Professional brand storytelling and founder narrative angles.",
    label: "LinkedIn",
    value: "linkedin",
  },
];

const trendToneMap: Record<TagTrendSignal, "default" | "info" | "success" | "warning"> = {
  emerging: "warning",
  high: "success",
  medium: "info",
  relevance_only: "default",
};

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40";

function humanizeTrendSignal(signal: TagTrendSignal) {
  return signal === "relevance_only" ? "Relevance only" : `${signal} signal`;
}

function dispatchApplyTagEvent(tags: TagDiscoveryTag[]) {
  window.dispatchEvent(
    new CustomEvent("studio:apply-tag-discovery", {
      detail: {
        tags,
      },
    }),
  );
}

export function TagDiscoveryDock() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<TagDiscoveryResult | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<TagDiscoveryPlatform[]>([
    "instagram",
    "tiktok",
    "youtube-shorts",
  ]);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isShotDetailPage = /^\/dashboard\/shots\/[^/]+$/.test(pathname);

  useEffect(() => {
    setVoiceSupported(
      typeof window !== "undefined" &&
        typeof MediaRecorder !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    );

    return () => {
      recorderRef.current = null;
      chunksRef.current = [];

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  function togglePlatform(platform: TagDiscoveryPlatform) {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) {
        return current.length === 1
          ? current
          : current.filter((entry) => entry !== platform);
      }

      return [...current, platform];
    });
  }

  async function submitDiscovery(audioBlob?: Blob) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery && !audioBlob) {
      setError("Enter a few keywords or record a short voice note.");
      return;
    }

    setApplySuccess(null);
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("query", trimmedQuery);

      for (const platform of selectedPlatforms) {
        formData.append("platforms", platform);
      }

      if (audioBlob) {
        formData.append(
          "audio",
          new File([audioBlob], `voice-note-${Date.now()}.webm`, {
            type: audioBlob.type || "audio/webm",
          }),
        );
      }

      const response = await fetch("/api/agent/tags", {
        body: formData,
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | (TagDiscoveryResult & { error?: string })
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to generate current tags.");
      }

      setResult(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate current tags.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function startRecording() {
    if (!voiceSupported) {
      setError("Voice notes are not available in this browser.");
      return;
    }

    setApplySuccess(null);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ].find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        recorderRef.current = null;

        if (streamRef.current) {
          for (const track of streamRef.current.getTracks()) {
            track.stop();
          }

          streamRef.current = null;
        }

        setIsRecording(false);

        if (audioBlob.size === 0) {
          setError("The voice note was empty. Try again with a short spoken brief.");
          return;
        }

        void submitDiscovery(audioBlob);
      });

      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Microphone access was denied or unavailable.");
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  function applyTag(tag: TagDiscoveryTag) {
    dispatchApplyTagEvent([tag]);
    setApplySuccess(`Applied ${tag.label} to the current shot workspace.`);
  }

  function applyAllTags() {
    if (!result || result.tags.length === 0) {
      return;
    }

    dispatchApplyTagEvent(result.tags);
    setApplySuccess(`Applied ${result.tags.length} discovery tags to the current shot workspace.`);
  }

  return (
    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,14,22,0.92),rgba(6,10,18,0.86))] p-4">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label="Tag discovery" tone="info" />
            <StatusPill
              label={
                result?.source === "openai-web-search"
                  ? "Current web-backed"
                  : "Fallback ready"
              }
              tone={result?.source === "openai-web-search" ? "success" : "warning"}
            />
            <StatusPill
              label={voiceSupported ? "Voice prompt ready" : "Text prompt ready"}
              tone={voiceSupported ? "success" : "default"}
            />
            {isShotDetailPage ? <StatusPill label="Shot page detected" tone="success" /> : null}
            {result?.model ? <StatusPill label={result.model} tone="default" /> : null}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Search current creative tags from a typed brief or a short voice note
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Feed the operator intent, selected platforms, and live web context into one tag scan
              that stays honest about what is current versus fallback-only.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickBriefs.map((brief) => (
              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium tracking-[0.14em] text-slate-300 uppercase transition hover:border-cyan-400/30 hover:text-white"
                key={brief}
                onClick={() => {
                  setQuery(brief);
                  void submitDiscovery();
                }}
                type="button"
              >
                {brief}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {platformOptions.map((platform) => {
              const selected = selectedPlatforms.includes(platform.value);

              return (
                <button
                  className={cx(
                    "rounded-[22px] border px-4 py-4 text-left transition",
                    selected
                      ? "border-cyan-400/30 bg-cyan-400/10 text-white"
                      : "border-white/8 bg-black/16 text-slate-300 hover:border-white/16 hover:text-white",
                  )}
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{platform.label}</p>
                    <span
                      className={cx(
                        "h-2.5 w-2.5 rounded-full",
                        selected ? "bg-cyan-300" : "bg-slate-600",
                      )}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {platform.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase"
            htmlFor="tag-discovery-query"
          >
            Search brief
          </label>
          <textarea
            className={inputClassName}
            id="tag-discovery-query"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Describe the product, offer, audience, tone, and where the campaign needs to win."
            rows={5}
            value={query}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs leading-5 text-slate-500">
              Say a short paragraph and stop recording to auto-run the tag scan.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className={cx(
                  "inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition",
                  isRecording
                    ? "border-rose-400/30 bg-rose-400/12 text-rose-100 hover:bg-rose-400/18"
                    : "border-white/10 bg-white/6 text-slate-200 hover:border-cyan-400/30 hover:text-white",
                )}
                disabled={isLoading || !voiceSupported}
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                    return;
                  }

                  void startRecording();
                }}
                type="button"
              >
                {isRecording ? "Stop voice note" : "Record voice note"}
              </button>
              <Button
                disabled={isLoading || isRecording}
                onClick={() => {
                  void submitDiscovery();
                }}
                type="button"
              >
                {isLoading ? "Scanning..." : "Generate tags"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      {applySuccess ? (
        <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {applySuccess}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-[24px] border border-white/8 bg-black/16 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">Relevant tags for the current brief</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{result.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill
                  label={result.source === "openai-web-search" ? "Current web scan" : "Fallback"}
                  tone={result.source === "openai-web-search" ? "success" : "warning"}
                />
                <StatusPill
                  label={result.inputMode === "hybrid" ? "Text + audio" : result.inputMode}
                  tone="default"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Search context
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{result.query}</p>
                  <p className="mt-3 text-xs tracking-[0.14em] text-slate-500 uppercase">
                    {result.freshnessLabel} / {result.platforms.join(" / ")}
                  </p>
                </div>

                {isShotDetailPage && result.tags.length > 0 ? (
                  <Button onClick={applyAllTags} size="md" type="button" variant="secondary">
                    Apply all to current shot
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {result.tags.map((tag) => (
                <div
                  className="rounded-[22px] border border-white/8 bg-white/4 p-4"
                  key={`${tag.label}-${tag.platforms.join("-")}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-base font-semibold text-white">{tag.label}</p>
                    <StatusPill
                      label={humanizeTrendSignal(tag.trendSignal)}
                      tone={trendToneMap[tag.trendSignal]}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{tag.rationale}</p>
                  <p className="mt-3 text-xs tracking-[0.16em] text-slate-500 uppercase">
                    {tag.platforms.join(" / ")}
                  </p>
                  {isShotDetailPage ? (
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => applyTag(tag)}
                        size="md"
                        type="button"
                        variant="secondary"
                      >
                        Apply to current shot
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {result.transcript ? (
              <div className="rounded-[24px] border border-white/8 bg-black/16 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Transcript
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{result.transcript}</p>
              </div>
            ) : null}

            <div className="rounded-[24px] border border-white/8 bg-black/16 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Source links
              </p>
              {result.citations.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {result.citations.map((citation) => (
                    <a
                      className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3 text-sm text-slate-200 transition hover:border-cyan-400/20 hover:text-white"
                      href={citation.url}
                      key={citation.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <p className="font-medium text-white">{citation.title}</p>
                      <p className="mt-1 break-all text-xs leading-5 text-slate-500">
                        {citation.url}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  No live source links were returned for this run. When that happens, the dock keeps
                  the tags clearly labeled as fallback or limited-citation output instead of
                  pretending they are fully current.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
