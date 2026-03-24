import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { ProviderCard } from "@/components/dashboard/provider-card";
import { Panel } from "@/components/studio/panel";
import { StatusPill } from "@/components/studio/status-pill";
import { ButtonLink } from "@/components/ui/button";
import { getDashboardHomeData } from "@/lib/studio/repository";
import { listProviderCatalog } from "@/lib/studio/providers";

export default async function DashboardHomePage() {
  const dashboard = await getDashboardHomeData();
  const providers = listProviderCatalog();

  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_44%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-violet-100 uppercase">
              Operator dashboard
            </span>
            <div className="space-y-3">
              <h1 className="display-font text-5xl leading-none text-white sm:text-6xl">
                Plan campaigns, route shots, and review outputs from one studio control room.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300">
                AI Video Studio keeps briefs, prompt structure, provider routing, asset tracking,
                and review decisions in one production-minded workflow for internal operators.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/dashboard/campaigns?compose=new" size="lg">
                Create campaign
              </ButtonLink>
              <ButtonLink href="/dashboard/shots" size="lg" variant="secondary">
                Open shot queue
              </ButtonLink>
              <ButtonLink href="/dashboard/assets" size="lg" variant="secondary">
                Browse assets
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-4">
              <p className="font-semibold text-white">Workspace mode</p>
              <div className="mt-3">
                <StatusPill
                  label={dashboard.mode === "live" ? "Live workspace" : "Demo workspace"}
                  tone={dashboard.mode === "live" ? "success" : "warning"}
                />
              </div>
              <p className="mt-3 leading-6 text-slate-400">
                Live mode uses Supabase-backed records. Demo mode keeps the operator flow usable
                until admin credentials are configured.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-4">
              <p className="font-semibold text-white">Routing stance</p>
              <p className="mt-2 leading-6 text-slate-400">
                Sora for hero polish, Kling for controlled motion and talent beats, Higgsfield for
                exploratory cinematic work.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <MetricCard helper={stat.helper} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Recent campaigns
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Briefs moving through production</h2>
            </div>
            <Link
              className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              href="/dashboard/campaigns"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Campaign</th>
                  <th className="pb-3 pr-4 font-medium">Client</th>
                  <th className="pb-3 pr-4 font-medium">Platforms</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {dashboard.recentCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="py-4 pr-4">
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="mt-1 text-slate-400">{campaign.objective}</p>
                    </td>
                    <td className="py-4 pr-4 text-slate-300">
                      {campaign.clientName}
                      <div className="mt-1 text-slate-500">{campaign.brandName}</div>
                    </td>
                    <td className="py-4 pr-4 text-slate-300">{campaign.targetPlatforms.join(", ")}</td>
                    <td className="py-4 pr-4">
                      <StatusPill status={campaign.status} />
                    </td>
                    <td className="py-4 text-slate-300">
                      <Link
                        className="font-medium text-cyan-300 transition hover:text-cyan-200"
                        href={`/dashboard/campaigns/${campaign.id}`}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Quick actions
          </p>
          <div className="mt-4 grid gap-4">
            <Link
              className="rounded-[24px] border border-white/8 bg-black/14 p-4 transition hover:border-white/16"
              href="/dashboard/campaigns?compose=new"
            >
              <p className="font-semibold text-white">Create a production campaign</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Capture the brief, offer, audience, and target platforms before scenes and shots
                start moving.
              </p>
            </Link>
            <Link
              className="rounded-[24px] border border-white/8 bg-black/14 p-4 transition hover:border-white/16"
              href="/dashboard/shots"
            >
              <p className="font-semibold text-white">Work the shot queue</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Refine prompt structure, confirm model routing, and keep generation-ready shots
                moving into review.
              </p>
            </Link>
            <Link
              className="rounded-[24px] border border-white/8 bg-black/14 p-4 transition hover:border-white/16"
              href="/dashboard/reviews"
            >
              <p className="font-semibold text-white">Review selects and rejects</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Compare realism, brand fit, hook strength, and editability before final handoff.
              </p>
            </Link>
            <Link
              className="rounded-[24px] border border-white/8 bg-black/14 p-4 transition hover:border-white/16"
              href="/dashboard/settings"
            >
              <p className="font-semibold text-white">Open system settings</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Inspect provider readiness, integration gaps, and the next build order without
                leaving the product.
              </p>
            </Link>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Recent shots
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What operators are actively shaping</h2>
            </div>
            <Link
              className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              href="/dashboard/shots"
            >
              View queue
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {dashboard.recentShots.map((shot) => (
              <Link
                className="rounded-[28px] border border-white/8 bg-black/14 p-5 transition hover:border-white/16"
                href={`/dashboard/shots/${shot.id}`}
                key={shot.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xl font-semibold text-white">{shot.title}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {shot.campaignName} • Scene {shot.sceneNumber}, shot {shot.shotNumber}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill label={shot.targetModel} tone="info" />
                    <StatusPill status={shot.status} />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{shot.purpose}</p>
                <p className="mt-4 text-xs tracking-[0.16em] text-slate-500 uppercase">
                  {shot.aspectRatio} • {shot.durationSeconds}s
                </p>
              </Link>
            ))}
          </div>
        </Panel>

        <div className="grid gap-4">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </section>
    </div>
  );
}
