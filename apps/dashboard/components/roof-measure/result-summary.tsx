"use client";

import { useMemo, useState } from "react";

import { Panel } from "@/components/studio/panel";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/roof-measure/utils";
import type { MeasurementJob } from "@/types/roof-measure";

interface ResultSummaryProps {
  measurementJob: MeasurementJob;
  shareUrl?: string;
  notice?: string;
}

function methodLabel(method: MeasurementJob["source"]) {
  if (method === "manual") {
    return "Manual";
  }

  if (method === "assisted") {
    return "Assisted";
  }

  return "Auto";
}

export function ResultSummary({
  measurementJob,
  notice,
  shareUrl,
}: ResultSummaryProps) {
  const [copied, setCopied] = useState(false);

  const downloadName = useMemo(() => {
    const slug = measurementJob.address.formattedAddress
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return `${slug || "roof-measurement"}-${measurementJob.id}.json`;
  }, [measurementJob.address.formattedAddress, measurementJob.id]);

  function handleDownload() {
    const blob = new Blob([JSON.stringify(measurementJob, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyShareLink() {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <div className="grid gap-6">
      <Panel className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">
                {methodLabel(measurementJob.source)} measurement
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                {measurementJob.persistenceMode === "supabase" ? "Saved" : "Guest result"}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white">
                {measurementJob.address.formattedAddress}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                Created {formatDate(measurementJob.createdAt)}. Results are estimate-grade
                and should be field-verified before ordering, pricing, or permitting.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownload} variant="secondary">
              Download JSON
            </Button>
            <Button onClick={() => window.print()} variant="ghost">
              Print
            </Button>
            {shareUrl ? (
              <Button onClick={() => void handleCopyShareLink()} variant="ghost">
                {copied ? "Copied" : "Copy share link"}
              </Button>
            ) : null}
          </div>
        </div>

        {notice ? (
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {notice}
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Total footprint area</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {formatNumber(measurementJob.totalAreaSqft)} sq ft
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Total perimeter</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {formatNumber(measurementJob.totalPerimeterFt)} ft
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Structures</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {measurementJob.primaryStructureCount}
          </p>
        </Panel>
      </div>

      <Panel className="p-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-white">Structure breakdown</h3>
          <p className="text-sm leading-7 text-slate-300">
            Each structure keeps raw polygon coordinates for future exports and API handoff.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {measurementJob.structures.map((structure) => (
            <div
              className="rounded-[24px] border border-white/8 bg-black/14 p-5"
              key={structure.structureId}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{structure.label}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {structure.userAdjusted ? "User adjusted" : "No post-draw adjustment"} •{" "}
                    {methodLabel(structure.method)}
                  </p>
                </div>
                <div className="text-sm text-slate-300 sm:text-right">
                  <p>{formatNumber(structure.areaSqft)} sq ft</p>
                  <p>{formatNumber(structure.perimeterFt)} ft perimeter</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
