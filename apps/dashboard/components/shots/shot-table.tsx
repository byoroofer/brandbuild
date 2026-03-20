import Link from "next/link";

import { StatusPill } from "@/components/studio/status-pill";
import type { Shot } from "@/lib/studio/types";

type ShotTableProps = {
  shots: Array<Shot & { campaignName?: string }>;
};

export function ShotTable({ shots }: ShotTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr>
            <th className="pb-3 pr-4 font-medium">Scene</th>
            <th className="pb-3 pr-4 font-medium">Shot</th>
            <th className="pb-3 pr-4 font-medium">Model</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Duration</th>
            <th className="pb-3 font-medium">Open</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6">
          {shots.map((shot) => (
            <tr key={shot.id}>
              <td className="py-4 pr-4 text-slate-300">
                S{shot.sceneNumber}
                <div className="mt-1 text-slate-500">#{shot.shotNumber}</div>
              </td>
              <td className="py-4 pr-4">
                <p className="font-medium text-white">{shot.title}</p>
                <p className="mt-1 text-slate-400">{shot.purpose}</p>
                {shot.campaignName ? <p className="mt-1 text-slate-500">{shot.campaignName}</p> : null}
              </td>
              <td className="py-4 pr-4 text-slate-300">{shot.targetModel}</td>
              <td className="py-4 pr-4">
                <StatusPill status={shot.status} />
              </td>
              <td className="py-4 pr-4 text-slate-300">{shot.durationSeconds}s</td>
              <td className="py-4 text-slate-300">
                <Link className="font-medium text-cyan-300 transition hover:text-cyan-200" href={`/dashboard/shots/${shot.id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
