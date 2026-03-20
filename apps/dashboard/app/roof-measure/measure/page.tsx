import { Suspense } from "react";

import { RoofMeasureWorkspace } from "@/components/roof-measure/workspace";
import { Panel } from "@/components/studio/panel";

export default function RoofMeasureWorkspacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-6">
        <Panel className="p-8">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-100 uppercase">
              Roof Measure workspace
            </span>
            <h1 className="text-4xl font-semibold text-white">Address to imagery to outline</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300">
              Customer confirms the target structure with a drop pin first. After that, trace
              the roof perimeter, edit vertices if needed, and save the report.
            </p>
          </div>
        </Panel>

        <Suspense fallback={<Panel className="p-6 text-sm text-slate-300">Loading workspace...</Panel>}>
          <RoofMeasureWorkspace />
        </Suspense>
      </div>
    </div>
  );
}
