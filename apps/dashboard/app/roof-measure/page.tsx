import { AddressLaunchCard } from "@/components/roof-measure/address-launch-card";
import { Panel } from "@/components/studio/panel";

export default function RoofMeasurePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-6">
        <Panel className="overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_26%),radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_44%)]" />
          <div className="relative space-y-4">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-100 uppercase">
              LOW EARTH ORBIT
            </span>
            <div className="space-y-3">
              <h1 className="display-font text-5xl leading-none text-white sm:text-6xl">
                Roof Measure
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                Enter the property address, center the imagery, confirm the structure with a
                drop pin, and trace the roof outline to generate a fast estimate-grade report.
              </p>
            </div>
          </div>
        </Panel>

        <AddressLaunchCard
          ctaLabel="Open map workspace"
          description="Use the address field below to launch the live map workspace. The customer confirms the correct structure first, then the roof can be traced and saved."
          title="Start a roof measurement"
        />
      </div>
    </div>
  );
}
