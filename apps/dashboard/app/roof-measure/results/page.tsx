"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ResultSummary } from "@/components/roof-measure/result-summary";
import { Panel } from "@/components/studio/panel";
import type { MeasurementJob } from "@/types/roof-measure";

export default function LocalRoofMeasureResultPage() {
  const [measurementJob, setMeasurementJob] = useState<MeasurementJob | null>(null);

  useEffect(() => {
    const rawMeasurement = window.localStorage.getItem("leo:last-measurement");

    if (!rawMeasurement) {
      return;
    }

    try {
      setMeasurementJob(JSON.parse(rawMeasurement) as MeasurementJob);
    } catch {
      setMeasurementJob(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-6">
        <Panel className="p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Result
            </p>
            <h1 className="text-4xl font-semibold text-white">Guest measurement result</h1>
          </div>
        </Panel>

        {measurementJob ? (
          <ResultSummary
            measurementJob={measurementJob}
            notice="This result is stored in local browser storage because Supabase persistence is not configured yet."
          />
        ) : (
          <Panel className="p-8 text-slate-300">
            No guest result is available in local storage. Start from the{" "}
            <Link className="font-medium text-cyan-300 underline" href="/roof-measure/measure">
              measure page
            </Link>
            .
          </Panel>
        )}
      </div>
    </div>
  );
}
