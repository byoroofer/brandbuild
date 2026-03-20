"use client";

import { useState } from "react";

import { StatusPill } from "@/components/studio/status-pill";
import type { Asset, Campaign, Shot, WorkspaceMode } from "@/lib/studio/types";

type AssetLibraryProps = {
  assets: Asset[];
  campaigns: Campaign[];
  mode: WorkspaceMode;
  shots: Shot[];
};

function getAssetTone(type: Asset["type"]) {
  switch (type) {
    case "generated_video":
      return "from-violet-500/40 via-fuchsia-500/30 to-cyan-400/30";
    case "reference_image":
      return "from-cyan-500/30 via-blue-500/20 to-slate-400/20";
    case "thumbnail":
      return "from-amber-500/30 via-orange-400/20 to-rose-400/20";
    case "logo":
      return "from-slate-500/30 via-slate-400/20 to-slate-300/10";
    case "product_image":
      return "from-emerald-500/30 via-cyan-400/20 to-slate-300/10";
    case "character_sheet":
      return "from-violet-500/30 via-slate-500/20 to-amber-400/10";
    default:
      return "from-slate-500/30 via-slate-400/20 to-slate-300/10";
  }
}

export function AssetLibrary({ assets, campaigns, mode, shots }: AssetLibraryProps) {
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [shotFilter, setShotFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<Asset["type"] | "all">("all");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(assets[0]?.id ?? null);

  const filteredAssets = assets.filter((asset) => {
    if (campaignFilter !== "all" && asset.campaignId !== campaignFilter) {
      return false;
    }

    if (shotFilter !== "all" && asset.shotId !== shotFilter) {
      return false;
    }

    if (typeFilter !== "all" && asset.type !== typeFilter) {
      return false;
    }

    return true;
  });

  const selectedAsset =
    filteredAssets.find((asset) => asset.id === selectedAssetId) ??
    filteredAssets[0] ??
    null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Asset library
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">References, renders, and selects</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Filter assets by campaign, shot, and type, then inspect the metadata that matters for review and handoff.
            </p>
          </div>

          <StatusPill label={mode === "live" ? "Live mode" : "Demo mode"} tone={mode === "live" ? "success" : "warning"} />
        </div>

        <div className="app-shell rounded-[30px] p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <select className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none" onChange={(event) => setCampaignFilter(event.target.value)} value={campaignFilter}>
              <option value="all">All campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>

            <select className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none" onChange={(event) => setShotFilter(event.target.value)} value={shotFilter}>
              <option value="all">All shots</option>
              {shots.map((shot) => (
                <option key={shot.id} value={shot.id}>
                  {shot.title}
                </option>
              ))}
            </select>

            <select className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none" onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)} value={typeFilter}>
              <option value="all">All asset types</option>
              <option value="reference_image">Reference image</option>
              <option value="generated_video">Generated video</option>
              <option value="thumbnail">Thumbnail</option>
              <option value="logo">Logo</option>
              <option value="product_image">Product image</option>
              <option value="character_sheet">Character sheet</option>
            </select>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredAssets.map((asset) => (
              <button
                className="rounded-[28px] border border-white/8 bg-black/14 p-4 text-left transition hover:border-white/16"
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                type="button"
              >
                <div className={`rounded-[22px] bg-gradient-to-br ${getAssetTone(asset.type)} p-6`}>
                  <p className="text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
                    {asset.type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-white">{asset.fileName}</p>
                </div>
                <p className="mt-4 text-sm text-slate-300">{asset.metadataJson.aspect_ratio ?? asset.metadataJson.version ?? "Studio asset"}</p>
                <p className="mt-2 text-sm text-slate-500">{new Date(asset.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="app-shell rounded-[30px] p-6">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Detail drawer
        </p>
        {selectedAsset ? (
          <div className="mt-4 space-y-5">
            <div className={`rounded-[24px] bg-gradient-to-br ${getAssetTone(selectedAsset.type)} p-6`}>
              <p className="text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
                {selectedAsset.type.replaceAll("_", " ")}
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">{selectedAsset.fileName}</h2>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div>
                <span className="text-slate-500">Campaign</span>
                <p className="mt-1">
                  {campaigns.find((campaign) => campaign.id === selectedAsset.campaignId)?.name ?? "Unknown campaign"}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Shot</span>
                <p className="mt-1">
                  {shots.find((shot) => shot.id === selectedAsset.shotId)?.title ?? "Campaign-level asset"}
                </p>
              </div>
              <div>
                <span className="text-slate-500">File URL</span>
                <a
                  className="mt-1 inline-flex break-all text-cyan-300 transition hover:text-cyan-200"
                  href={selectedAsset.fileUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {selectedAsset.fileUrl}
                </a>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
              <p className="text-sm font-semibold text-white">Metadata</p>
              <dl className="mt-4 grid gap-3 text-sm text-slate-300">
                {Object.entries(selectedAsset.metadataJson).map(([key, value]) => (
                  <div className="flex items-start justify-between gap-4" key={key}>
                    <dt className="text-slate-500">{key}</dt>
                    <dd className="text-right">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-black/14 p-6 text-sm leading-6 text-slate-400">
            No assets match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
