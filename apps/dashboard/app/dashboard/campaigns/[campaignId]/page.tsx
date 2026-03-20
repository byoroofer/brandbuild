import Link from "next/link";
import { notFound } from "next/navigation";

import { ShotTable } from "@/components/shots/shot-table";
import { Panel } from "@/components/studio/panel";
import { StatusPill } from "@/components/studio/status-pill";
import { ButtonLink } from "@/components/ui/button";
import { getCampaignDetail } from "@/lib/studio/repository";

type CampaignDetailPageProps = {
  params: Promise<{ campaignId: string }>;
};

function formatAverage(values: number[]) {
  if (values.length === 0) {
    return "0.0";
  }

  return (values.reduce((total, value) => total + value, 0) / values.length).toFixed(1);
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = await params;
  const detail = await getCampaignDetail(campaignId);

  if (!detail) {
    notFound();
  }

  const selectedCount = detail.reviews.filter((review) => review.decision === "selected").length;
  const pendingCount = detail.reviews.filter((review) =>
    ["pending", "hold"].includes(review.decision),
  ).length;
  const averageRealism = formatAverage(detail.reviews.map((review) => review.scoreRealism));
  const averageBrandFit = formatAverage(detail.reviews.map((review) => review.scoreBrandFit));
  const sceneCount = new Set(detail.shots.map((shot) => shot.sceneNumber)).size;

  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_44%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-violet-100 uppercase">
              Campaign detail
            </span>
            <div className="space-y-3">
              <h1 className="display-font text-5xl leading-none text-white sm:text-6xl">
                {detail.campaign.name}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                {detail.campaign.objective}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill
                label={detail.mode === "live" ? "Live workspace" : "Demo workspace"}
                tone={detail.mode === "live" ? "success" : "warning"}
              />
              <StatusPill status={detail.campaign.status} />
              <StatusPill label={detail.campaign.clientName} tone="info" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/assets" size="lg" variant="secondary">
              Open asset library
            </ButtonLink>
            <ButtonLink href="/dashboard/reviews" size="lg" variant="secondary">
              Review queue
            </ButtonLink>
          </div>
        </div>
      </Panel>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Scenes planned</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sceneCount}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Shots tracked</p>
          <p className="mt-3 text-4xl font-semibold text-white">{detail.shots.length}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Assets tracked</p>
          <p className="mt-3 text-4xl font-semibold text-white">{detail.assets.length}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-slate-400">Selected outputs</p>
          <p className="mt-3 text-4xl font-semibold text-white">{selectedCount}</p>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <Panel className="p-6">
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Campaign summary
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Client</p>
              <p className="mt-2 text-base text-white">{detail.campaign.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Brand</p>
              <p className="mt-2 text-base text-white">{detail.campaign.brandName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Audience</p>
              <p className="mt-2 text-base leading-7 text-slate-300">{detail.campaign.audience}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Offer</p>
              <p className="mt-2 text-base leading-7 text-slate-300">{detail.campaign.offer}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Call to action</p>
              <p className="mt-2 text-base leading-7 text-slate-300">{detail.campaign.callToAction}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Target platforms</p>
              <p className="mt-2 text-base leading-7 text-slate-300">
                {detail.campaign.targetPlatforms.join(", ")}
              </p>
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Review status
          </p>
          <div className="mt-4 grid gap-4">
            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
              <p className="text-sm text-slate-400">Average realism</p>
              <p className="mt-2 text-3xl font-semibold text-white">{averageRealism}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
              <p className="text-sm text-slate-400">Average brand fit</p>
              <p className="mt-2 text-3xl font-semibold text-white">{averageBrandFit}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
              <p className="text-sm text-slate-400">Pending decisions</p>
              <p className="mt-2 text-3xl font-semibold text-white">{pendingCount}</p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_400px]">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Scenes and shots
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Production shot plan</h2>
            </div>
            <Link
              className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              href="/dashboard/shots"
            >
              Open queue
            </Link>
          </div>
          <div className="mt-6">
            <ShotTable shots={detail.shots} />
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Assets
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Campaign support files</h2>
            </div>
            <Link
              className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              href="/dashboard/assets"
            >
              View library
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {detail.assets.map((asset) => (
              <div className="rounded-[24px] border border-white/8 bg-black/14 p-4" key={asset.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{asset.fileName}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {asset.shotId
                        ? detail.shots.find((shot) => shot.id === asset.shotId)?.title ?? "Shot asset"
                        : "Campaign-level asset"}
                    </p>
                  </div>
                  <StatusPill label={asset.type} tone="info" />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
