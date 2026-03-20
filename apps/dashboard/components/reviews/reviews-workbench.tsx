"use client";

import { useState } from "react";

import { StatusPill } from "@/components/studio/status-pill";
import type { ReviewsSummary } from "@/lib/studio/types";

type ReviewsWorkbenchProps = {
  summary: ReviewsSummary;
};

export function ReviewsWorkbench({ summary }: ReviewsWorkbenchProps) {
  const [selectionFilter, setSelectionFilter] = useState<"all" | "selected" | "rejected">("all");
  const [minimumScore, setMinimumScore] = useState<number>(0);

  const filteredReviews = summary.reviews.filter((review) => {
    if (selectionFilter === "selected" && review.decision !== "selected") {
      return false;
    }

    if (selectionFilter === "rejected" && review.decision !== "rejected") {
      return false;
    }

    return (
      review.scoreBrandFit >= minimumScore &&
      review.scoreEditability >= minimumScore &&
      review.scoreHookStrength >= minimumScore &&
      review.scoreRealism >= minimumScore
    );
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Reviews
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Selects, rejects, and scoring notes</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Review output quality across realism, brand fit, hook strength, and editability so final selects are easy to defend and hand off.
          </p>
        </div>

        <StatusPill
          label={summary.mode === "live" ? "Live mode" : "Demo mode"}
          tone={summary.mode === "live" ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="app-shell rounded-[28px] p-5">
          <p className="text-sm text-slate-400">Avg realism</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.averageRealism}</p>
        </div>
        <div className="app-shell rounded-[28px] p-5">
          <p className="text-sm text-slate-400">Avg brand fit</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.averageBrandFit}</p>
        </div>
        <div className="app-shell rounded-[28px] p-5">
          <p className="text-sm text-slate-400">Selected outputs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.selectedCount}</p>
        </div>
        <div className="app-shell rounded-[28px] p-5">
          <p className="text-sm text-slate-400">Rejected outputs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.rejectedCount}</p>
        </div>
      </div>

      <div className="app-shell rounded-[30px] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              className={`rounded-full border px-4 py-2 text-sm ${selectionFilter === "all" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-white/10 text-slate-300"}`}
              onClick={() => setSelectionFilter("all")}
              type="button"
            >
              All reviews
            </button>
            <button
              className={`rounded-full border px-4 py-2 text-sm ${selectionFilter === "selected" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100" : "border-white/10 text-slate-300"}`}
              onClick={() => setSelectionFilter("selected")}
              type="button"
            >
              Selected
            </button>
            <button
              className={`rounded-full border px-4 py-2 text-sm ${selectionFilter === "rejected" ? "border-rose-400/40 bg-rose-400/10 text-rose-100" : "border-white/10 text-slate-300"}`}
              onClick={() => setSelectionFilter("rejected")}
              type="button"
            >
              Rejected
            </button>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-300">
            Minimum score
            <select
              className="rounded-2xl border border-white/10 bg-black/18 px-4 py-2 text-sm text-white outline-none"
              onChange={(event) => setMinimumScore(Number(event.target.value))}
              value={minimumScore}
            >
              <option value={0}>Any</option>
              <option value={6}>6+</option>
              <option value={7}>7+</option>
              <option value={8}>8+</option>
              <option value={9}>9+</option>
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-4">
          {filteredReviews.map((review) => (
            <div className="rounded-[28px] border border-white/8 bg-black/14 p-5" key={review.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xl font-semibold text-white">{review.asset?.fileName ?? "Asset"}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {review.campaignName} • {review.shot?.title ?? "Shot not linked"}
                  </p>
                </div>

                <StatusPill status={review.decision} />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
                  Realism: {review.scoreRealism}
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
                  Brand fit: {review.scoreBrandFit}
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
                  Hook: {review.scoreHookStrength}
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
                  Editability: {review.scoreEditability}
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">{review.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
