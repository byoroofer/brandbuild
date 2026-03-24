import Link from "next/link";

import { StudioAgentDock } from "@/components/dashboard/studio-agent-dock";
import { TagDiscoveryDock } from "@/components/dashboard/tag-discovery-dock";
import { WorkflowLaunchpad } from "@/components/dashboard/workflow-launchpad";
import { Panel } from "@/components/studio/panel";
import { StatusPill } from "@/components/studio/status-pill";
import { ButtonLink } from "@/components/ui/button";
import type { WorkspaceMode } from "@/lib/studio/types";

type CommandBarProps = {
  mode: WorkspaceMode;
};

export function CommandBar({ mode }: CommandBarProps) {
  return (
    <Panel className="p-4">
      <div className="grid gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill
                label={mode === "live" ? "Live workspace" : "Demo workspace"}
                tone={mode === "live" ? "success" : "warning"}
              />
              <StatusPill label="Command center" tone="info" />
            </div>

            <div>
              <p className="text-lg font-semibold text-white">
                Guide operators step by step, translate intent, and keep the queue moving.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The command center should make three generators feel like one guided workflow:
                clarify the ask, route the right engine, generate the shot, and move straight into
                review.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                className="text-sm font-medium text-slate-400 transition hover:text-white"
                href="/dashboard/assets"
              >
                Asset library
              </Link>
              <Link
                className="text-sm font-medium text-slate-400 transition hover:text-white"
                href="/dashboard/reviews"
              >
                Review queue
              </Link>
              <Link
                className="text-sm font-medium text-slate-400 transition hover:text-white"
                href="/dashboard/shots"
              >
                Shot queue
              </Link>
              <Link
                className="text-sm font-medium text-slate-400 transition hover:text-white"
                href="/dashboard/settings"
              >
                Settings
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/campaigns?compose=new" size="md">
              New campaign
            </ButtonLink>
            <ButtonLink href="/dashboard/shots" size="md" variant="secondary">
              Shot queue
            </ButtonLink>
          </div>
        </div>

        <WorkflowLaunchpad mode={mode} />
        <TagDiscoveryDock />
        <StudioAgentDock />
      </div>
    </Panel>
  );
}
