"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusPill } from "@/components/studio/status-pill";
import type {
  Asset,
  Campaign,
  HandoffPackage,
  Shot,
  VersionCandidate,
  VersionGroup,
  WorkspaceMode,
} from "@/lib/studio/types";

type AssetLibraryProps = {
  assets: Asset[];
  campaigns: Campaign[];
  handoffPackages: HandoffPackage[];
  mode: WorkspaceMode;
  shots: Shot[];
  versionGroups: VersionGroup[];
};

type WorkspaceView = "library" | "versions" | "handoff";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
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

function renderPreview(asset: Asset | null) {
  if (!asset?.fileUrl) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/16 text-sm text-slate-400">
        Preview unavailable
      </div>
    );
  }

  if (isVideoAsset(asset)) {
    return (
      <video
        className="h-48 w-full rounded-[24px] border border-white/8 bg-black/30 object-cover"
        controls
        loop
        muted
        playsInline
        preload="metadata"
        src={asset.fileUrl}
      />
    );
  }

  return (
    <img
      alt={asset.fileName}
      className="h-48 w-full rounded-[24px] border border-white/8 bg-black/30 object-cover"
      src={asset.fileUrl}
    />
  );
}

function providerLabel(provider: VersionCandidate["provider"]) {
  if (!provider) return "Unrouted";
  return provider[0].toUpperCase() + provider.slice(1);
}

function providerTone(provider: VersionCandidate["provider"]) {
  if (provider === "sora") return "info" as const;
  if (provider === "kling") return "warning" as const;
  if (provider === "higgsfield") return "success" as const;
  return "default" as const;
}

function downloadHandoffPack(pack: HandoffPackage) {
  const payload = {
    campaign: {
      id: pack.campaign.id,
      name: pack.campaign.name,
      clientName: pack.campaign.clientName,
      brandName: pack.campaign.brandName,
    },
    checklist: pack.deliverableChecklist,
    editorNotes: pack.editorNotes,
    exportReady: pack.exportReady,
    missingShots: pack.missingShots.map((shot) => ({
      id: shot.id,
      title: shot.title,
      status: shot.status,
      targetModel: shot.targetModel,
    })),
    selectedVersions: pack.selectedVersions.map((candidate) => ({
      assetId: candidate.asset.id,
      fileName: candidate.asset.fileName,
      fileUrl: candidate.asset.fileUrl,
      provider: candidate.provider,
      shotTitle: candidate.shot?.title ?? null,
      averageScore: candidate.averageScore,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `brandbuild-handoff-${pack.campaign.slug ?? pack.campaign.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AssetLibrary({
  assets,
  campaigns,
  handoffPackages,
  mode,
  shots,
  versionGroups,
}: AssetLibraryProps) {
  const [view, setView] = useState<WorkspaceView>("library");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(assets[0]?.id ?? null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    versionGroups[0]?.shot?.id ?? versionGroups[0]?.versionCandidates[0]?.id ?? null,
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    versionGroups[0]?.versionCandidates[0]?.id ?? null,
  );
  const [selectedPackId, setSelectedPackId] = useState<string | null>(handoffPackages[0]?.id ?? null);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (campaignFilter !== "all" && asset.campaignId !== campaignFilter) return false;
      if (!normalizedQuery) return true;
      const campaignName = campaigns.find((campaign) => campaign.id === asset.campaignId)?.name ?? "";
      const shotTitle = shots.find((shot) => shot.id === asset.shotId)?.title ?? "";
      return [asset.fileName, asset.type, campaignName, shotTitle]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [assets, campaignFilter, campaigns, normalizedQuery, shots]);

  const filteredGroups = useMemo(() => {
    return versionGroups.filter((group) => {
      if (campaignFilter !== "all" && group.campaign?.id !== campaignFilter) return false;
      if (!normalizedQuery) return true;
      return [group.campaign?.name ?? "", group.shot?.title ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [campaignFilter, normalizedQuery, versionGroups]);

  const filteredPacks = useMemo(() => {
    return handoffPackages.filter((pack) => {
      if (campaignFilter !== "all" && pack.campaign.id !== campaignFilter) return false;
      if (!normalizedQuery) return true;
      return [pack.campaign.name, pack.campaign.clientName, pack.campaign.brandName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [campaignFilter, handoffPackages, normalizedQuery]);

  const selectedAsset =
    filteredAssets.find((asset) => asset.id === selectedAssetId) ?? filteredAssets[0] ?? null;
  const selectedGroup =
    filteredGroups.find((group) => (group.shot?.id ?? group.versionCandidates[0]?.id) === selectedGroupId) ??
    filteredGroups[0] ??
    null;
  const selectedCandidate =
    selectedGroup?.versionCandidates.find((candidate) => candidate.id === selectedCandidateId) ??
    selectedGroup?.versionCandidates.find((candidate) => candidate.id === selectedGroup.selectedCandidateId) ??
    selectedGroup?.versionCandidates[0] ??
    null;
  const selectedPack = filteredPacks.find((pack) => pack.id === selectedPackId) ?? filteredPacks[0] ?? null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Assets and deliverables
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Track versions and prepare final handoff
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Keep the library, version history, and export-ready campaign packs together in one
            operator view.
          </p>
        </div>

        <StatusPill
          label={mode === "live" ? "Live mode" : "Demo mode"}
          tone={mode === "live" ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-white/8 bg-black/14 p-5">
          <p className="text-sm text-slate-400">Tracked assets</p>
          <p className="mt-2 text-3xl font-semibold text-white">{assets.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-black/14 p-5">
          <p className="text-sm text-slate-400">Version groups</p>
          <p className="mt-2 text-3xl font-semibold text-white">{versionGroups.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-black/14 p-5">
          <p className="text-sm text-slate-400">Selected outputs</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {handoffPackages.reduce((total, pack) => total + pack.selectedVersions.length, 0)}
          </p>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-black/14 p-5">
          <p className="text-sm text-slate-400">Export-ready campaigns</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {handoffPackages.filter((pack) => pack.exportReady).length}
          </p>
        </div>
      </div>

      <div className="app-shell rounded-[30px] p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {(["library", "versions", "handoff"] as const).map((value) => (
              <button
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  view === value
                    ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 text-slate-300 hover:border-white/18"
                }`}
                key={value}
                onClick={() => setView(value)}
                type="button"
              >
                {value === "library" ? "Library" : value === "versions" ? "Versions" : "Handoff"}
              </button>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <input
              className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campaigns, shots, or assets"
              value={query}
            />
            <select
              className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none"
              onChange={(event) => setCampaignFilter(event.target.value)}
              value={campaignFilter}
            >
              <option value="all">All campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {view === "library" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="app-shell rounded-[30px] p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAssets.map((asset) => (
                <button
                  className={`rounded-[28px] border p-4 text-left transition ${
                    selectedAsset?.id === asset.id
                      ? "border-cyan-400/35 bg-cyan-400/8"
                      : "border-white/8 bg-black/14 hover:border-white/16"
                  }`}
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  type="button"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {asset.type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-white">{asset.fileName}</p>
                  <p className="mt-2 text-sm text-slate-400">{formatDate(asset.createdAt)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="app-shell rounded-[30px] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Detail drawer
            </p>
            {selectedAsset ? (
              <div className="mt-4 space-y-5">
                {renderPreview(selectedAsset)}
                <div className="space-y-3 text-sm text-slate-300">
                  <p className="text-xl font-semibold text-white">{selectedAsset.fileName}</p>
                  <p>
                    <span className="text-slate-500">Campaign:</span>{" "}
                    {campaigns.find((campaign) => campaign.id === selectedAsset.campaignId)?.name ??
                      "Unknown campaign"}
                  </p>
                  <p>
                    <span className="text-slate-500">Shot:</span>{" "}
                    {shots.find((shot) => shot.id === selectedAsset.shotId)?.title ??
                      "Campaign-level asset"}
                  </p>
                  <a
                    className="inline-flex text-cyan-300 transition hover:text-cyan-200"
                    href={selectedAsset.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open asset
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-black/14 p-6 text-sm leading-6 text-slate-400">
                No assets match the current filters.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {view === "versions" ? (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="app-shell rounded-[30px] p-4">
            <div className="grid max-h-[840px] gap-3 overflow-y-auto pr-1">
              {filteredGroups.map((group) => {
                const key = group.shot?.id ?? group.versionCandidates[0]?.id ?? "";

                return (
                  <button
                    className={`rounded-[28px] border p-4 text-left transition ${
                      (selectedGroup?.shot?.id ?? selectedGroup?.versionCandidates[0]?.id ?? null) === key
                        ? "border-cyan-400/35 bg-cyan-400/8"
                        : "border-white/8 bg-black/14 hover:border-white/16"
                    }`}
                    key={key}
                    onClick={() => {
                      setSelectedGroupId(key);
                      setSelectedCandidateId(group.versionCandidates[0]?.id ?? null);
                    }}
                    type="button"
                  >
                    <p className="text-sm text-slate-400">{group.campaign?.name ?? "Unknown campaign"}</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {group.shot?.title ?? "Unlinked versions"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusPill label={`${group.candidateCount} versions`} tone="default" />
                      <StatusPill
                        label={group.readyForHandoff ? "Ready for handoff" : `${group.pendingReviewCount} pending`}
                        tone={group.readyForHandoff ? "success" : "warning"}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6">
            {selectedGroup && selectedCandidate ? (
              <>
                <div className="app-shell rounded-[30px] p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{selectedGroup.campaign?.name ?? "Unknown campaign"}</p>
                      <h2 className="mt-2 text-3xl font-semibold text-white">
                        {selectedGroup.shot?.title ?? "Version detail"}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedGroup.shot?.id ? (
                        <Link
                          className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/16"
                          href={`/dashboard/shots/${selectedGroup.shot.id}`}
                        >
                          Open shot
                        </Link>
                      ) : null}
                      <Link
                        className="inline-flex items-center justify-center rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/6"
                        href="/dashboard/reviews"
                      >
                        Compare outputs
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="grid gap-4 xl:grid-cols-2">
                    {selectedGroup.versionCandidates.map((candidate) => (
                      <button
                        className={`app-shell rounded-[30px] p-4 text-left transition ${
                          candidate.id === selectedCandidate.id
                            ? "border-cyan-400/35 bg-cyan-400/8"
                            : "hover:border-white/16"
                        }`}
                        key={candidate.id}
                        onClick={() => setSelectedCandidateId(candidate.id)}
                        type="button"
                      >
                        <div className="flex flex-wrap gap-2">
                          <StatusPill
                            label={providerLabel(candidate.provider)}
                            tone={providerTone(candidate.provider)}
                          />
                          {candidate.review?.decision ? (
                            <StatusPill status={candidate.review.decision} />
                          ) : (
                            <StatusPill label="Needs review" tone="warning" />
                          )}
                        </div>
                        <div className="mt-4">
                          {renderPreview(candidate.thumbnailAsset ?? candidate.asset)}
                        </div>
                        <p className="mt-4 text-lg font-semibold text-white">{candidate.asset.fileName}</p>
                      </button>
                    ))}
                  </div>

                  <div className="app-shell rounded-[30px] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Version detail
                    </p>
                    <div className="mt-4">{renderPreview(selectedCandidate.asset)}</div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <StatusPill
                        label={providerLabel(selectedCandidate.provider)}
                        tone={providerTone(selectedCandidate.provider)}
                      />
                      {selectedCandidate.review?.decision ? (
                        <StatusPill status={selectedCandidate.review.decision} />
                      ) : (
                        <StatusPill label="Needs review" tone="warning" />
                      )}
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-slate-300">
                      <p className="text-xl font-semibold text-white">{selectedCandidate.asset.fileName}</p>
                      <p>
                        <span className="text-slate-500">Created:</span> {formatDate(selectedCandidate.createdAt)}
                      </p>
                      <p>
                        <span className="text-slate-500">Average score:</span>{" "}
                        {selectedCandidate.averageScore !== null
                          ? selectedCandidate.averageScore.toFixed(1)
                          : "Unscored"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="app-shell rounded-[30px] p-10 text-center text-sm leading-7 text-slate-400">
                No version groups match the current filters.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {view === "handoff" ? (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="app-shell rounded-[30px] p-4">
            <div className="grid max-h-[840px] gap-3 overflow-y-auto pr-1">
              {filteredPacks.map((pack) => (
                <button
                  className={`rounded-[28px] border p-4 text-left transition ${
                    selectedPack?.id === pack.id
                      ? "border-emerald-400/35 bg-emerald-400/8"
                      : "border-white/8 bg-black/14 hover:border-white/16"
                  }`}
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  type="button"
                >
                  <p className="text-sm text-slate-400">{pack.campaign.clientName}</p>
                  <p className="mt-1 text-xl font-semibold text-white">{pack.campaign.name}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill
                      label={pack.exportReady ? "Export ready" : "Needs selects"}
                      tone={pack.exportReady ? "success" : "warning"}
                    />
                    <StatusPill label={`${pack.selectedVersions.length} selected`} tone="default" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {selectedPack ? (
              <>
                <div className="app-shell rounded-[30px] p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{selectedPack.campaign.clientName}</p>
                      <h2 className="mt-2 text-3xl font-semibold text-white">
                        {selectedPack.campaign.name}
                      </h2>
                    </div>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/16"
                      onClick={() => downloadHandoffPack(selectedPack)}
                      type="button"
                    >
                      Download handoff manifest
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="grid gap-6">
                    <div className="app-shell rounded-[30px] p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Deliverable checklist
                      </p>
                      <div className="mt-4 grid gap-3">
                        {selectedPack.deliverableChecklist.map((item) => (
                          <div
                            className="rounded-[24px] border border-white/8 bg-black/14 px-4 py-4 text-sm text-slate-300"
                            key={item}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="app-shell rounded-[30px] p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Selected outputs
                      </p>
                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        {selectedPack.selectedVersions.map((candidate) => (
                          <div
                            className="rounded-[28px] border border-white/8 bg-black/14 p-4"
                            key={candidate.id}
                          >
                            <div className="flex flex-wrap gap-2">
                              <StatusPill
                                label={providerLabel(candidate.provider)}
                                tone={providerTone(candidate.provider)}
                              />
                              <StatusPill status={candidate.review?.decision ?? "selected"} />
                            </div>
                            <div className="mt-4">
                              {renderPreview(candidate.thumbnailAsset ?? candidate.asset)}
                            </div>
                            <p className="mt-4 text-lg font-semibold text-white">
                              {candidate.shot?.title ?? candidate.asset.fileName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="app-shell rounded-[30px] p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Editor notes
                      </p>
                      {selectedPack.editorNotes.length > 0 ? (
                        <div className="mt-4 grid gap-3">
                          {selectedPack.editorNotes.map((note) => (
                            <div
                              className="rounded-[24px] border border-white/8 bg-black/14 px-4 py-4 text-sm leading-7 text-slate-300"
                              key={note}
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-black/14 p-5 text-sm leading-6 text-slate-400">
                          No explicit editor notes are attached yet.
                        </div>
                      )}
                    </div>

                    <div className="app-shell rounded-[30px] p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Missing selects
                      </p>
                      {selectedPack.missingShots.length > 0 ? (
                        <div className="mt-4 grid gap-3">
                          {selectedPack.missingShots.map((shot) => (
                            <div
                              className="rounded-[24px] border border-white/8 bg-black/14 p-4"
                              key={shot.id}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-white">{shot.title}</p>
                                  <p className="mt-2 text-sm text-slate-400">
                                    {shot.targetModel} / {shot.status.replaceAll("_", " ")}
                                  </p>
                                </div>
                                <Link
                                  className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                                  href={`/dashboard/shots/${shot.id}`}
                                >
                                  Open shot
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[24px] border border-dashed border-emerald-400/20 bg-emerald-400/8 p-5 text-sm leading-6 text-emerald-100">
                          Every tracked shot in this campaign has at least one selected version.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="app-shell rounded-[30px] p-10 text-center text-sm leading-7 text-slate-400">
                No handoff package matches the current filters.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
