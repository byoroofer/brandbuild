import { AddressLaunchCard } from "@/components/roof-measure/address-launch-card";
import { Panel } from "@/components/studio/panel";

export default function NewScanPage() {
  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_26%),radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_44%)]" />
        <div className="relative space-y-4">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-100 uppercase">
            Uploads and reports
          </span>
          <div className="space-y-3">
            <h1 className="display-font text-5xl leading-none text-white sm:text-6xl">
              Start the roof report from the uploads flow.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300">
              Enter the property address here, launch Roof Measure, let the customer confirm
              the correct structure with a drop pin, and then trace the roof outline for the
              report.
            </p>
          </div>
        </div>
      </Panel>

      <AddressLaunchCard
        ctaLabel="Start roof report"
        description="This belongs on the uploads page so the report can start before any other scan workflow. The address entered here carries directly into the map workspace."
        title="Buy Roof Measurement Report"
      />

      <Panel className="p-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">Current flow</h2>
          <p className="text-sm leading-7 text-slate-300">
            Roof Measure is restored here first. The customer enters the address, confirms the
            correct structure with a map pin, traces the roof, and saves the result.
          </p>
        </div>
      </Panel>
    </div>
  );
}
