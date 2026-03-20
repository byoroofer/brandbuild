import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  actionLinks,
  featuredPolicies,
  opposePoints,
  policyThemes,
  supportPoints,
} from "@/lib/site-content";

export default function PolicyPage() {
  return (
    <div className="page-shell flex flex-col gap-20">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-6">
            <SectionHeading
              description="The live site already carries a substantial legislative slate. The real upgrade is turning that substance into a clearer, more premium information system."
              eyebrow="Proposed legislation"
              title="Policy depth that feels authored, organized, and campaign-grade."
            />
            <p className="prose-copy text-base">
              Instead of one long page that asks visitors to work too hard, the rebuild separates
              the agenda into themes, featured proposals, support positions, opposition signals, and
              a cleaner path for policy feedback.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/donate" variant="secondary">
                Fuel the campaign
              </ButtonLink>
              <ButtonLink href={actionLinks.email} variant="ghost">
                Share a legislative idea
              </ButtonLink>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-4 sm:grid-cols-2">
          {policyThemes.map((theme) => (
            <SurfaceCard className="p-6" key={theme.title} tone="light">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
                {theme.eyebrow}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-[var(--text-dark)]">{theme.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-dark-muted)]">
                {theme.description}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard className="p-8 sm:p-10" tone="light">
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
              Publicly supports
            </p>
            <h2 className="display-font text-4xl leading-none text-[var(--text-dark)]">
              A broad platform anchored in fairness, healthcare, education, and accountability.
            </h2>
            <div className="grid gap-3">
              {supportPoints.map((item) => (
                <div
                  className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 text-sm text-[var(--text-dark-muted)] shadow-[0_12px_24px_rgba(15,23,42,0.04)]"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
              Publicly rejects
            </p>
            <h2 className="display-font text-4xl leading-none text-white">
              A cleaner contrast with corruption, extremism, and political gaslighting.
            </h2>
            <div className="grid gap-3">
              {opposePoints.map((item) => (
                <div
                  className="rounded-[1.4rem] border border-white/10 bg-white/4 px-5 py-4 text-sm text-[var(--text-muted)]"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="The agenda becomes more persuasive when each proposal gets its own cleaner module with enough breathing room to feel intentional."
          eyebrow="Featured agenda"
          title="Eight policy pillars with sharper hierarchy and scan quality."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {featuredPolicies.map((policy) => (
            <SurfaceCard className="p-8" key={policy.title}>
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                  Legislative proposal
                </p>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-white">{policy.title}</h3>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">
                    {policy.description}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12" tone="light">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,155,82,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(113,136,255,0.12),transparent_32%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow !text-[var(--text-dark-muted)] before:bg-[linear-gradient(90deg,rgba(90,102,127,0.85),transparent)]">
              Policy feedback
            </span>
            <h2 className="display-font text-4xl leading-none text-[var(--text-dark)] sm:text-5xl">
              Have a legislative suggestion the campaign should hear?
            </h2>
            <p className="text-base leading-8 text-[var(--text-dark-muted)]">
              The redesigned CTA keeps participation easy: send the idea directly, then help fund
              the campaign work required to turn it into something real.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={actionLinks.email} variant="light">
              Share your idea
            </ButtonLink>
            <ButtonLink href="/donate" variant="secondary">
              Donate
            </ButtonLink>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
