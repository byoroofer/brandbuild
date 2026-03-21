import Link from "next/link";
import { notFound } from "next/navigation";

import { PromptBuilder } from "@/components/shots/prompt-builder";
import { ShotWorkflowCoach } from "@/components/shots/shot-workflow-coach";
import { Panel } from "@/components/studio/panel";
import { StatusPill } from "@/components/studio/status-pill";
import { ButtonLink } from "@/components/ui/button";
import {
  getShotDetail,
  isStudioPersistenceEnabled,
} from "@/lib/studio/repository";

type ShotDetailPageProps = {
  params: Promise<{ shotId: string }>;
};

function formatAverage(values: number[]) {
  if (values.length === 0) {
    return "0.0";
  }

  return (values.reduce((total, value) => total + value, 0) / values.length).toFixed(1);
}

export default async function ShotDetailPage({ params }: ShotDetailPageProps) {
  const { shotId } = await params;
  const detail = await getShotDetail(shotId);

  if (!detail) {
    notFound();
  }

  const shotAssets = detail.assets.filter((asset) => asset.shotId === detail.shot.id);
  const campaignAssets = detail.assets.filter((asset) => asset.shotId !== detail.shot.id);

  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_44%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-violet-100 uppercase">
              Shot detail
            </span>
            <div className="space-y-3">
              <h1 className="display-font text-5xl leading-none text-white sm:text-6xl">
                {detail.shot.title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300">{detail.shot.purpose}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill
                label={detail.mode === "live" ? "Live workspace" : "Demo workspace"}
                tone={detail.mode === "live" ? "success" : "warning"}
              />
              <StatusPill label={detail.shot.targetModel} tone="info" />
              <StatusPill status={detail.shot.status} />
              <StatusPill label={`${detail.generations.length} runs`} tone="default" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={`/dashboard/campaigns/${detail.campaign.id}`}
              size="lg"
              variant="secondary"
            >
              Open campaign
            </ButtonLink>
            <ButtonLink href="/dashboard/assets" size="lg" variant="secondary">
              Asset library
            </ButtonLink>
          </div>
        </div>
      </Panel>

      <ShotWorkflowCoach
        campaignId={detail.campaign.id}
        generations={detail.generations}
        reviewRecords={detail.reviews}
        routingRecommendation={detail.routingRecommendation}
        shot={detail.shot}
        shotAssets={shotAssets}
        supportAssetCount={campaignAssets.length}
      />

      <PromptBuilder
        generations={detail.generations}
        mode={detail.mode}
        persistenceEnabled={isStudioPersistenceEnabled()}
        promptTemplates={detail.promptTemplates}
        reviewCount={detail.reviews.length}
        routingRecommendation={detail.routingRecommendation}
        shot={detail.shot}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]" id="associated-assets">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Associated assets
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                References and outputs for this shot
              </h2>
            </div>
            <Link
              className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              href="/dashboard/assets"
            >
              View library
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {shotAssets.map((asset) => (
              <div className="rounded-[24px] border border-white/8 bg-black/14 p-4" key={asset.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{asset.fileName}</p>
                    <a
                      className="mt-2 inline-flex text-sm text-cyan-300 transition hover:text-cyan-200"
                      href={asset.fileUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open asset
                    </a>
                  </div>
                  <StatusPill label={asset.type} tone="info" />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-500">
                  {Object.entries(asset.metadataJson).map(([key, value]) => (
                    <p key={key}>
                      {key}: {String(value)}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {shotAssets.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/14 p-6 text-sm leading-6 text-slate-400">
                No shot-linked assets are tracked yet. Use the asset library as the next step when
                uploads and generation outputs land.
              </div>
            ) : null}
          </div>

          {campaignAssets.length > 0 ? (
            <div className="mt-6 rounded-[28px] border border-white/8 bg-black/12 p-5">
              <p className="text-sm font-semibold text-white">Campaign-level support assets</p>
              <div className="mt-4 grid gap-3">
                {campaignAssets.map((asset) => (
                  <div className="flex items-center justify-between gap-4" key={asset.id}>
                    <div>
                      <p className="text-sm text-slate-200">{asset.fileName}</p>
                      <p className="mt-1 text-xs tracking-[0.14em] text-slate-500 uppercase">
                        {asset.type.replaceAll("_", " ")}
                      </p>
                    </div>
                    <StatusPill label="Campaign asset" tone="default" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel className="p-6" id="review-panel">
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Review panel
          </p>

          <div className="mt-4 grid gap-4">
            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
              <p className="text-sm text-slate-400">Average realism</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {formatAverage(detail.reviews.map((review) => review.scoreRealism))}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/14 p-4">
              <p className="text-sm text-slate-400">Average brand fit</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {formatAverage(detail.reviews.map((review) => review.scoreBrandFit))}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {detail.reviews.map((review) => (
              <div className="rounded-[24px] border border-white/8 bg-black/14 p-4" key={review.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {shotAssets.find((asset) => asset.id === review.assetId)?.fileName ??
                        "Reviewed asset"}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusPill status={review.decision} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300">
                  <p>Realism: {review.scoreRealism}</p>
                  <p>Brand fit: {review.scoreBrandFit}</p>
                  <p>Hook strength: {review.scoreHookStrength}</p>
                  <p>Editability: {review.scoreEditability}</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{review.notes}</p>
              </div>
            ))}

            {detail.reviews.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/14 p-6 text-sm leading-6 text-slate-400">
                No review records yet. Once outputs are scored, this panel becomes the decision log
                for selects and change requests.
              </div>
            ) : null}
          </div>
        </Panel>
      </section>
    </div>
  );
}
