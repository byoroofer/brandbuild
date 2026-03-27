import { Panel } from "@/components/studio/panel";
import { StatusPill } from "@/components/studio/status-pill";
import { ButtonLink } from "@/components/ui/button";
import type { StudioSystemAudit } from "@/lib/studio/system-audit";
import { cx } from "@/lib/utils";

type StudioControlCenterProps = {
  audit: StudioSystemAudit;
};

function getAuditTone(status: "working" | "partial" | "missing" | "blocked") {
  switch (status) {
    case "working":
      return "success" as const;
    case "blocked":
      return "danger" as const;
    case "partial":
      return "warning" as const;
    case "missing":
      return "default" as const;
  }
}

function getProviderTone(
  readiness: "validated" | "live-configured" | "live-capable" | "awaiting-credentials",
) {
  switch (readiness) {
    case "validated":
      return "success" as const;
    case "live-configured":
      return "info" as const;
    case "live-capable":
      return "warning" as const;
    case "awaiting-credentials":
      return "default" as const;
  }
}

function humanizeReadiness(
  readiness: "validated" | "live-configured" | "live-capable" | "awaiting-credentials",
) {
  switch (readiness) {
    case "validated":
      return "Validated";
    case "live-configured":
      return "Configured";
    case "live-capable":
      return "Live-capable";
    case "awaiting-credentials":
      return "Needs credentials";
  }
}

function getArchitectureTone(state: "implemented" | "partial" | "missing") {
  switch (state) {
    case "implemented":
      return "success" as const;
    case "partial":
      return "warning" as const;
    case "missing":
      return "default" as const;
  }
}

function ArchitectureCard({
  nextMove,
  state,
  summary,
  title,
}: StudioSystemAudit["architecture"][number]) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-black/14 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">{summary}</p>
        </div>
        <StatusPill label={state} tone={getArchitectureTone(state)} />
      </div>
      <div className="mt-5 rounded-[22px] border border-white/8 bg-white/4 p-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
          Next move
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{nextMove}</p>
      </div>
    </div>
  );
}

function AuditList({
  items,
  title,
}: {
  items: StudioSystemAudit["working"] | StudioSystemAudit["partial"] | StudioSystemAudit["missing"];
  title: string;
}) {
  return (
    <Panel className="p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-white">{title}</p>
        <StatusPill label={`${items.length} items`} tone="default" />
      </div>

      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div className="rounded-[24px] border border-white/8 bg-black/14 p-4" key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{item.title}</p>
              </div>
              <StatusPill label={item.status} tone={getAuditTone(item.status)} />
            </div>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-400">
              {item.notes.map((note) => (
                <li key={note}>- {note}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function StudioControlCenter({ audit }: StudioControlCenterProps) {
  const totalWorking = audit.working.length;
  const totalPartial = audit.partial.length;
  const totalMissing = audit.missing.length;

  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_44%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusPill label="Studio control center" tone="info" />
              <StatusPill label="Integration audit" tone="success" />
            </div>
            <div className="space-y-3">
              <h1 className="display-font text-5xl leading-none text-white sm:text-6xl">
                Run BrandBuild like one operating system, not three disconnected tools.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                This page is the product truth layer: what already works, what still breaks, what
                is missing, and what has to happen next to make Sora, Kling, and Higgsfield feel
                unified for operators.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-4">
              <p className="text-sm text-slate-400">Working now</p>
              <p className="mt-2 text-3xl font-semibold text-white">{totalWorking}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-4">
              <p className="text-sm text-slate-400">Needs hardening</p>
              <p className="mt-2 text-3xl font-semibold text-white">{totalPartial}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-4">
              <p className="text-sm text-slate-400">Missing layers</p>
              <p className="mt-2 text-3xl font-semibold text-white">{totalMissing}</p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/shots" size="lg">
            Open shot queue
          </ButtonLink>
          <ButtonLink href="/dashboard/assets" size="lg" variant="secondary">
            Browse assets
          </ButtonLink>
          <ButtonLink href="/dashboard/reviews" size="lg" variant="secondary">
            Review outputs
          </ButtonLink>
        </div>
      </Panel>

      <section className="grid gap-6 xl:grid-cols-3">
        <AuditList items={audit.working} title="What works now" />
        <AuditList items={audit.partial} title="What is partially working" />
        <AuditList items={audit.missing} title="What is still missing" />
      </section>

      <Panel className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Provider matrix
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Exact integration state for Sora, Kling, and Higgsfield
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Snapshot generated {new Date(audit.generatedAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {audit.providerAudits.map((provider) => (
            <div
              className="rounded-[28px] border border-white/8 bg-black/14 p-5"
              key={provider.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                    {provider.id}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{provider.label}</h3>
                </div>
                <StatusPill
                  label={humanizeReadiness(provider.readiness)}
                  tone={getProviderTone(provider.readiness)}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">{provider.currentState}</p>

              <div className="mt-5 grid gap-3 text-sm text-slate-400">
                <div>
                  <span className="text-slate-500">Auth</span>
                  <p className="mt-1 text-slate-200">{provider.authMethod}</p>
                </div>
                <div>
                  <span className="text-slate-500">Inputs</span>
                  <p className="mt-1 text-slate-200">{provider.inputFormat}</p>
                </div>
                <div>
                  <span className="text-slate-500">Outputs</span>
                  <p className="mt-1 text-slate-200">{provider.outputFormat}</p>
                </div>
                <div>
                  <span className="text-slate-500">Async handling</span>
                  <p className="mt-1 text-slate-200">{provider.asyncHandling}</p>
                </div>
                <div>
                  <span className="text-slate-500">Webhooks</span>
                  <p className="mt-1 text-slate-200">{provider.webhookStatus}</p>
                </div>
                <div>
                  <span className="text-slate-500">Storage</span>
                  <p className="mt-1 text-slate-200">{provider.mediaStorage}</p>
                </div>
                <div>
                  <span className="text-slate-500">Rate limits / cost</span>
                  <p className="mt-1 text-slate-200">{provider.rateLimitNotes}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {provider.bestUseCases.map((useCase) => (
                  <span
                    className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs tracking-[0.16em] text-slate-300 uppercase"
                    key={useCase}
                  >
                    {useCase}
                  </span>
                ))}
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Current limitations
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                  {provider.limitations.map((limitation) => (
                    <li key={limitation}>- {limitation}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 rounded-[22px] border border-cyan-400/18 bg-cyan-400/10 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-cyan-100/70 uppercase">
                  Next integration moves
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-cyan-50/90">
                  {provider.nextSteps.map((step) => (
                    <li key={step}>- {step}</li>
                  ))}
                </ul>
              </div>

              <a
                className="mt-5 inline-flex text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                href={provider.docsUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open official docs
              </a>
            </div>
          ))}
        </div>
      </Panel>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel className="p-6">
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Recommended architecture
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            What BrandBuild needs to become the full production cockpit
          </h2>
          <div className="mt-6 grid gap-4">
            {audit.architecture.map((pillar) => (
              <ArchitectureCard key={pillar.title} {...pillar} />
            ))}
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel className="p-6">
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Implementation order
            </p>
            <div className="mt-5 grid gap-3">
              {audit.exactImplementationOrder.map((step) => (
                <div
                  className="rounded-[24px] border border-white/8 bg-black/14 px-4 py-4 text-sm leading-6 text-slate-300"
                  key={step}
                >
                  {step}
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
              UI and UX corrections
            </p>
            <div className="mt-5 grid gap-3">
              {audit.uiUxRecommendations.map((recommendation) => (
                <div
                  className={cx(
                    "rounded-[24px] border border-white/8 bg-black/14 px-4 py-4 text-sm leading-6 text-slate-300",
                  )}
                  key={recommendation}
                >
                  {recommendation}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
