"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusPill } from "@/components/studio/status-pill";
import type {
  Asset,
  ReviewComparisonCandidate,
  ReviewComparisonGroup,
  ReviewDecision,
  ReviewsSummary,
  TargetModel,
} from "@/lib/studio/types";

type ReviewsWorkbenchProps = {
  summary: ReviewsSummary;
};

const decisionOptions: Array<{ label: string; value: "all" | ReviewDecision }> = [
  { label: "All reviews", value: "all" },
  { label: "Selected", value: "selected" },
  { label: "Pending", value: "pending" },
  { label: "Hold", value: "hold" },
  { label: "Rejected", value: "rejected" },
];

const providerOptions: Array<{ label: string; value: "all" | TargetModel }> = [
  { label: "All engines", value: "all" },
  { label: "Sora", value: "sora" },
  { label: "Kling", value: "kling" },
  { label: "Higgsfield", value: "higgsfield" },
];

const providerLabels: Record<TargetModel, string> = {
  higgsfield: "Higgsfield",
  kling: "Kling",
  sora: "Sora",
};

function getAverageLabel(values: number[]) {
  if (values.length === 0) {
    return "0.0";
  }

  return (values.reduce((total, value) => total + value, 0) / values.length).toFixed(1);
}

function getProviderTone(provider: TargetModel | null | undefined) {
  switch (provider) {
    case "sora":
      return "info" as const;
    case "kling":
      return "warning" as const;
    case "higgsfield":
      return "success" as const;
    default:
      return "default" as const;
  }
}

function getAssetSurfaceTone(asset: Asset | null) {
  switch (asset?.type) {
    case "generated_video":
      return "from-violet-500/30 via-fuchsia-500/20 to-cyan-400/20";
    case "thumbnail":
      return "from-amber-500/25 via-rose-500/15 to-slate-500/10";
    case "reference_image":
    case "reference_video":
      return "from-cyan-500/25 via-sky-500/15 to-slate-500/10";
    default:
      return "from-slate-500/25 via-slate-400/15 to-slate-300/10";
  }
}

function getScoreTone(score: number) {
  if (score >= 8.5) {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100";
  }

  if (score >= 7) {
    return "border-cyan-400/25 bg-cyan-400/10 text-cyan-100";
  }

  if (score >= 5.5) {
    return "border-amber-400/25 bg-amber-400/10 text-amber-100";
  }

  return "border-rose-400/25 bg-rose-400/10 text-rose-100";
}

function isVideoAsset(asset: Asset | null) {
  if (!asset) {
    return false;
  }

  return (
    asset.mimeType?.startsWith("video/") === true ||
    asset.type === "generated_video" ||
    asset.type === "reference_video"
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function renderMedia(candidate: ReviewComparisonCandidate, emphasized: boolean) {
  if (!candidate.asset?.fileUrl) {
    return (
      <div
        className={`flex h-56 items-center justify-center rounded-[26px] bg-gradient-to-br ${getAssetSurfaceTone(candidate.asset)} text-center text-sm text-slate-300`}
      >
        Preview unavailable
      </div>
    );
  }

  if (isVideoAsset(candidate.asset)) {
    return (
      <video
        className="h-56 w-full rounded-[26px] border border-white/8 bg-black/30 object-cover"
        controls={emphasized}
        loop
        muted
        playsInline
        preload="metadata"
        src={candidate.asset.fileUrl}
      />
    );
  }

  return (
    <img
      alt={candidate.asset.fileName}
      className="h-56 w-full rounded-[26px] border border-white/8 bg-black/30 object-cover"
      src={candidate.asset.fileUrl}
    />
  );
}

function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-black/16 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function CandidateCard({
  active,
  candidate,
  onSelect,
}: {
  active: boolean;
  candidate: ReviewComparisonCandidate;
  onSelect: () => void;
}) {
  return (
    <button
      className={`app-shell rounded-[30px] p-4 text-left transition ${active ? "border-cyan-400/35 bg-cyan-400/8" : "hover:border-white/16"}`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={candidate.decision} />
          <StatusPill
            label={candidate.provider ? providerLabels[candidate.provider] : "Unrouted"}
            tone={getProviderTone(candidate.provider)}
          />
          {candidate.generation?.integrationMode ? (
            <StatusPill
              label={candidate.generation.integrationMode === "live" ? "Live run" : "Mock run"}
              tone={candidate.generation.integrationMode === "live" ? "success" : "warning"}
            />
          ) : null}
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getScoreTone(candidate.averageScore)}`}
        >
          Avg {candidate.averageScore.toFixed(1)}
        </span>
      </div>

      <div className="mt-4">{renderMedia(candidate, active)}</div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">
            {candidate.asset?.fileName ?? "Untitled output"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {candidate.campaignName} / {candidate.shot?.title ?? "Unknown shot"}
          </p>
        </div>

        <p className="text-sm text-slate-500">{formatShortDate(candidate.createdAt)}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
          Realism {candidate.scoreRealism}
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
          Brand fit {candidate.scoreBrandFit}
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
          Hook {candidate.scoreHookStrength}
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
          Editability {candidate.scoreEditability}
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-300">{candidate.notes}</p>
    </button>
  );
}

export function ReviewsWorkbench({ summary }: ReviewsWorkbenchProps) {
  const [decisionFilter, setDecisionFilter] = useState<"all" | ReviewDecision>("all");
  const [providerFilter, setProviderFilter] = useState<"all" | TargetModel>("all");
  const [minimumScore, setMinimumScore] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(
    summary.compareGroups[0]?.shot?.id ?? null,
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    summary.compareGroups[0]?.comparisonCandidates[0]?.id ?? null,
  );

  const filteredGroups = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const nextGroups: ReviewComparisonGroup[] = [];

    for (const group of summary.compareGroups) {
      const comparisonCandidates = group.comparisonCandidates.filter((candidate) => {
        if (decisionFilter !== "all" && candidate.decision !== decisionFilter) {
          return false;
        }

        if (providerFilter !== "all" && candidate.provider !== providerFilter) {
          return false;
        }

        if (candidate.averageScore < minimumScore) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          candidate.campaignName,
          candidate.shot?.title ?? "",
          candidate.asset?.fileName ?? "",
          candidate.notes,
          candidate.provider ? providerLabels[candidate.provider] : "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      });

      if (comparisonCandidates.length === 0) {
        continue;
      }

      const latestReviewAt = comparisonCandidates.reduce(
        (latest, candidate) =>
          candidate.createdAt > latest ? candidate.createdAt : latest,
        comparisonCandidates[0]?.createdAt ?? "",
      );

      nextGroups.push({
        ...group,
        averageScore: getAverageLabel(
          comparisonCandidates.map((candidate) => candidate.averageScore),
        ),
        candidateCount: comparisonCandidates.length,
        comparisonCandidates,
        latestReviewAt,
        selectedCount: comparisonCandidates.filter(
          (candidate) => candidate.decision === "selected",
        ).length,
        topCandidateId: comparisonCandidates[0]?.id ?? null,
      });
    }

    return nextGroups;
  }, [decisionFilter, minimumScore, providerFilter, searchQuery, summary.compareGroups]);

  const activeGroup =
    filteredGroups.find((group) => group.shot?.id === selectedShotId) ??
    filteredGroups[0] ??
    null;
  const activeCandidate =
    activeGroup?.comparisonCandidates.find((candidate) => candidate.id === selectedCandidateId) ??
    activeGroup?.comparisonCandidates[0] ??
    null;

  const candidateCount = filteredGroups.reduce(
    (total, group) => total + group.candidateCount,
    0,
  );
  const selectedCount = filteredGroups.reduce(
    (total, group) => total + group.selectedCount,
    0,
  );
  const topAverageScore = filteredGroups[0]?.averageScore ?? "0.0";

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="grid gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Compare outputs
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Pick the strongest render, faster
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Review grouped outputs shot by shot, compare decisions, and lock selects with full
              media context instead of scanning disconnected review rows.
            </p>
          </div>

          <StatusPill
            label={summary.mode === "live" ? "Live mode" : "Demo mode"}
            tone={summary.mode === "live" ? "success" : "warning"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <MetricTile label="Shots in compare" value={filteredGroups.length} />
          <MetricTile label="Candidates in view" value={candidateCount} />
          <MetricTile label="Selected outputs" value={selectedCount} />
          <MetricTile label="Top average score" value={topAverageScore} />
        </div>

        <div className="app-shell rounded-[30px] p-5">
          <div className="flex flex-col gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">Search</span>
              <input
                className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search shot, campaign, or asset"
                value={searchQuery}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {decisionOptions.map((option) => (
                <button
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    decisionFilter === option.value
                      ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-100"
                      : "border-white/10 text-slate-300 hover:border-white/18"
                  }`}
                  key={option.value}
                  onClick={() => setDecisionFilter(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-300">Engine</span>
                <select
                  className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none"
                  onChange={(event) =>
                    setProviderFilter(event.target.value as "all" | TargetModel)
                  }
                  value={providerFilter}
                >
                  {providerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-300">Minimum average</span>
                <select
                  className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none"
                  onChange={(event) => setMinimumScore(Number(event.target.value))}
                  value={minimumScore}
                >
                  <option value={0}>Any score</option>
                  <option value={6}>6.0+</option>
                  <option value={7}>7.0+</option>
                  <option value={8}>8.0+</option>
                  <option value={9}>9.0+</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="app-shell rounded-[30px] p-4">
          <div className="flex items-center justify-between gap-3 px-2 pb-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Shot groups
            </p>
            <p className="text-sm text-slate-500">{filteredGroups.length} ready</p>
          </div>

          <div className="grid max-h-[720px] gap-3 overflow-y-auto pr-1">
            {filteredGroups.map((group) => {
              const isActive = group.shot?.id === activeGroup?.shot?.id;
              const leadCandidate = group.comparisonCandidates[0] ?? null;

              return (
                <button
                  className={`rounded-[26px] border p-4 text-left transition ${
                    isActive
                      ? "border-cyan-400/35 bg-cyan-400/8"
                      : "border-white/8 bg-black/14 hover:border-white/16"
                  }`}
                  key={group.shot?.id ?? group.topCandidateId ?? group.latestReviewAt}
                  onClick={() => {
                    setSelectedShotId(group.shot?.id ?? null);
                    setSelectedCandidateId(group.comparisonCandidates[0]?.id ?? null);
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">
                        {group.campaign?.name ?? "Unknown campaign"}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {group.shot?.title ?? "Untitled shot"}
                      </p>
                    </div>

                    {group.shot?.status ? <StatusPill status={group.shot.status} /> : null}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {leadCandidate?.provider ? (
                      <StatusPill
                        label={providerLabels[leadCandidate.provider]}
                        tone={getProviderTone(leadCandidate.provider)}
                      />
                    ) : null}
                    <StatusPill
                      label={`${group.candidateCount} candidates`}
                      tone="default"
                    />
                    {group.selectedCount > 0 ? (
                      <StatusPill label={`${group.selectedCount} selected`} tone="success" />
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Average
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">{group.averageScore}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Latest review
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {formatShortDate(group.latestReviewAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredGroups.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-white/10 bg-black/12 p-5 text-sm leading-7 text-slate-400">
                No review groups match the current filters. Widen the score threshold or clear the
                search to bring candidates back into view.
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <section className="grid gap-6">
        {activeGroup && activeCandidate ? (
          <>
            <div className="app-shell rounded-[32px] p-6">
              <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-start 2xl:justify-between">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                      label={activeGroup.campaign?.name ?? "Unknown campaign"}
                      tone="default"
                    />
                    {activeGroup.shot?.targetModel ? (
                      <StatusPill
                        label={`${providerLabels[activeGroup.shot.targetModel]} route`}
                        tone={getProviderTone(activeGroup.shot.targetModel)}
                      />
                    ) : null}
                    {activeGroup.shot?.status ? <StatusPill status={activeGroup.shot.status} /> : null}
                  </div>

                  <h2 className="mt-4 text-3xl font-semibold text-white">
                    {activeGroup.shot?.title ?? "Unknown shot"}
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                    {activeGroup.shot?.purpose ??
                      "Compare candidates, choose the strongest output, and prepare the shot for handoff."}
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Prompt excerpt
                      </p>
                      <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-300">
                        {activeGroup.shot?.promptText ?? "No prompt saved for this shot yet."}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Compare status
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-white">
                        {activeGroup.candidateCount}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        candidate outputs in scope, {activeGroup.selectedCount} already marked as
                        selects
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Group average
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-white">
                        {activeGroup.averageScore}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        last reviewed {formatShortDate(activeGroup.latestReviewAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {activeGroup.shot?.id ? (
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/16"
                    href={`/dashboard/shots/${activeGroup.shot.id}`}
                  >
                    Open shot workspace
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-4 xl:grid-cols-2">
                {activeGroup.comparisonCandidates.map((candidate) => (
                  <CandidateCard
                    active={candidate.id === activeCandidate.id}
                    candidate={candidate}
                    key={candidate.id}
                    onSelect={() => setSelectedCandidateId(candidate.id)}
                  />
                ))}
              </div>

              <div className="app-shell rounded-[30px] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Focused review
                </p>

                <div className="mt-4">{renderMedia(activeCandidate, true)}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill status={activeCandidate.decision} />
                  <StatusPill
                    label={
                      activeCandidate.provider
                        ? providerLabels[activeCandidate.provider]
                        : "Unrouted"
                    }
                    tone={getProviderTone(activeCandidate.provider)}
                  />
                  {activeCandidate.generation?.providerStatus ? (
                    <StatusPill status={activeCandidate.generation.providerStatus} />
                  ) : null}
                </div>

                <div className="mt-5">
                  <h3 className="text-2xl font-semibold text-white">
                    {activeCandidate.asset?.fileName ?? "Untitled output"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {activeCandidate.notes}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/12 px-4 py-3 text-sm text-slate-300">
                    Motion quality {activeCandidate.scoreMotionQuality}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/12 px-4 py-3 text-sm text-slate-300">
                    Prompt fidelity {activeCandidate.scorePromptFidelity}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/12 px-4 py-3 text-sm text-slate-300">
                    Realism {activeCandidate.scoreRealism}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/12 px-4 py-3 text-sm text-slate-300">
                    Brand fit {activeCandidate.scoreBrandFit}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/12 px-4 py-3 text-sm text-slate-300">
                    Hook strength {activeCandidate.scoreHookStrength}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/12 px-4 py-3 text-sm text-slate-300">
                    Editability {activeCandidate.scoreEditability}
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-white/8 bg-black/14 p-4 text-sm text-slate-300">
                  <dl className="grid gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-slate-500">Campaign</dt>
                      <dd className="text-right text-white">{activeCandidate.campaignName}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-slate-500">Shot</dt>
                      <dd className="text-right text-white">
                        {activeCandidate.shot?.title ?? "Unknown shot"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-slate-500">Average score</dt>
                      <dd className="text-right text-white">
                        {activeCandidate.averageScore.toFixed(1)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-slate-500">Last review</dt>
                      <dd className="text-right text-white">
                        {formatShortDate(activeCandidate.createdAt)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-slate-500">Asset type</dt>
                      <dd className="text-right text-white">
                        {activeCandidate.asset?.type.replaceAll("_", " ") ?? "Unknown"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {activeCandidate.asset?.fileUrl ? (
                  <a
                    className="mt-5 inline-flex items-center justify-center rounded-full border border-white/12 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/6"
                    href={activeCandidate.asset.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open asset
                  </a>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="app-shell rounded-[32px] p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Compare outputs
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">No candidates in view</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Once reviews and generated outputs are attached to a shot, this workspace becomes the
              fastest place to compare engines, lock selects, and decide what moves into handoff.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
