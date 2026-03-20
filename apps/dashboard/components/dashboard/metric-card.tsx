import { Panel } from "@/components/studio/panel";

type MetricCardProps = {
  helper: string;
  label: string;
  value: string;
};

export function MetricCard({ helper, label, value }: MetricCardProps) {
  return (
    <Panel className="p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{helper}</p>
    </Panel>
  );
}
