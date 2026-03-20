"use client";

import Link from "next/link";
import { useState } from "react";

import { CreateCampaignModal } from "@/components/campaigns/create-campaign-modal";
import { StatusPill } from "@/components/studio/status-pill";
import type { Campaign, WorkspaceMode } from "@/lib/studio/types";

type CampaignTableProps = {
  campaigns: Campaign[];
  mode: WorkspaceMode;
  openCreateOnLoad?: boolean;
  persistenceEnabled: boolean;
};

export function CampaignTable({
  campaigns,
  mode,
  openCreateOnLoad = false,
  persistenceEnabled,
}: CampaignTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"createdAt" | "name" | "status">("createdAt");

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = campaigns
    .filter((campaign) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        campaign.name,
        campaign.clientName,
        campaign.brandName,
        campaign.objective,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (sortKey === "name") {
        return left.name.localeCompare(right.name);
      }

      if (sortKey === "status") {
        return left.status.localeCompare(right.status);
      }

      return right.createdAt.localeCompare(left.createdAt);
    });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Campaign list
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Production campaigns</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Search and sort campaign briefs, then jump into scenes, shots, assets, and review progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusPill label={mode === "live" ? "Live mode" : "Demo mode"} tone={mode === "live" ? "success" : "warning"} />
          <CreateCampaignModal openOnLoad={openCreateOnLoad} persistenceEnabled={persistenceEnabled} />
        </div>
      </div>

      <div className="app-shell rounded-[30px] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            className="w-full max-w-md rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by campaign, client, or brand"
            value={search}
          />

          <select
            className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            value={sortKey}
          >
            <option value="createdAt">Newest first</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 pr-4 font-medium">Campaign</th>
                <th className="pb-3 pr-4 font-medium">Client</th>
                <th className="pb-3 pr-4 font-medium">Platforms</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Created</th>
                <th className="pb-3 font-medium">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filtered.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="mt-1 text-slate-400">{campaign.objective}</p>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">
                    {campaign.clientName}
                    <div className="mt-1 text-slate-500">{campaign.brandName}</div>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{campaign.targetPlatforms.join(", ")}</td>
                  <td className="py-4 pr-4">
                    <StatusPill status={campaign.status} />
                  </td>
                  <td className="py-4 pr-4 text-slate-400">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-slate-300">
                    <Link className="font-medium text-cyan-300 transition hover:text-cyan-200" href={`/dashboard/campaigns/${campaign.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
