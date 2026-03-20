import { notFound } from "next/navigation";

import { ResultSummary } from "@/components/roof-measure/result-summary";
import { Panel } from "@/components/studio/panel";
import { roofMeasurePublicEnv } from "@/lib/roof-measure/env";
import { getMeasurementJobById } from "@/services/roof-measure/measurement/measurement-repository";

interface RoofMeasureResultDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoofMeasureResultDetailPage({
  params,
}: RoofMeasureResultDetailPageProps) {
  const { id } = await params;
  const measurementJob = await getMeasurementJobById(id);

  if (!measurementJob) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-6">
        <Panel className="p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Saved result
            </p>
            <h1 className="text-4xl font-semibold text-white">Roof measurement report</h1>
          </div>
        </Panel>

        <ResultSummary
          measurementJob={measurementJob}
          shareUrl={`${roofMeasurePublicEnv.appUrl}/roof-measure/results/${measurementJob.id}`}
        />
      </div>
    </div>
  );
}
