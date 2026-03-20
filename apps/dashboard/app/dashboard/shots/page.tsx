import { ShotTable } from "@/components/shots/shot-table";
import { Panel } from "@/components/studio/panel";
import { StatusPill } from "@/components/studio/status-pill";
import { listShots } from "@/lib/studio/repository";

export default async function ShotsPage() {
  const { mode, shots } = await listShots();
  const queuedCount = shots.filter((shot) => shot.status === "queued").length;
  const generatingCount = shots.filter((shot) => shot.status === "generating").length;
  const reviewReadyCount = shots.filter((shot) =>
    ["generated", "reviewed"].includes(shot.status),
  ).length;
  const selectedCount = shots.filter((shot) => shot.status === "selected").length;

  return (
    <div className="grid gap-6">
      <Panel className="p-8 sm:p-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-violet-100 uppercase">
              Shot queue
            </span>
            <div className="space-y-3">
              <h1 className="display-font text-5xl leading-none text-white sm:text-6xl">
                Keep the production queue structured from prompt draft through selects.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300">
                Every shot stays tied to a campaign brief, target model, aspect ratio, and review
                context so prompt engineering and approvals stay operationally clean.
              </p>
            </div>
          </div>

          <StatusPill
            label={mode === "live" ? "Live workspace" : "Demo workspace"}
            tone={mode === "live" ? "success" : "warning"}
          />
        </div>
      </Panel>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Queued</p>
          <p className="mt-3 text-4xl font-semibold text-white">{queuedCount}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Generating</p>
          <p className="mt-3 text-4xl font-semibold text-white">{generatingCount}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Review ready</p>
          <p className="mt-3 text-4xl font-semibold text-white">{reviewReadyCount}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Selected</p>
          <p className="mt-3 text-4xl font-semibold text-white">{selectedCount}</p>
        </Panel>
      </section>

      <Panel className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Queue detail
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Scene-by-scene shot backlog</h2>
          </div>
        </div>
        <div className="mt-6">
          <ShotTable shots={shots} />
        </div>
      </Panel>
    </div>
  );
}
