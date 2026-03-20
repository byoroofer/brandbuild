import { ActionGrid } from "@/components/site/action-grid";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  donationTiers,
  donationTrustPoints,
  donationUses,
  donorPaths,
} from "@/lib/site-content";

export default function DonatePage() {
  return (
    <div className="page-shell flex flex-col gap-20">
      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-6">
            <SectionHeading
              description="Donation pages should feel direct, high-trust, and friction-light. This rebuild keeps the existing processors but packages them inside a much stronger campaign surface."
              eyebrow="Donate"
              title="A premium fundraising page with clearer hierarchy and more confidence."
            />
            <p className="prose-copy text-base">
              The campaign already uses both ActBlue and Anedot. This page keeps both routes
              visible, raises the perceived quality, and makes the purpose of each contribution much
              easier to understand.
            </p>
          </div>
        </SurfaceCard>

        <ActionGrid
          cardTone="light"
          gridClassName="gap-4 sm:grid-cols-1 xl:grid-cols-1"
          items={donorPaths}
        />
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="Small-dollar fundraising gets stronger when supporters can picture the exact kind of work their contribution helps unlock."
          eyebrow="Suggested contribution levels"
          title="A cleaner amount ladder without the spammy campaign pressure."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {donationTiers.map((tier) => (
            <SurfaceCard className="p-7" key={tier.amount}>
              <div className="space-y-4">
                <p className="display-font text-4xl leading-none text-white">{tier.amount}</p>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white">{tier.title}</h2>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">{tier.description}</p>
                </div>
                <ButtonLink className="w-full" href={tier.href} variant="secondary">
                  {tier.ctaLabel}
                </ButtonLink>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard className="p-8 sm:p-10" tone="light">
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
              Trust and clarity
            </p>
            <h2 className="display-font text-4xl leading-none text-[var(--text-dark)]">
              Support should feel secure, clear, and connected to real campaign work.
            </h2>
            <div className="grid gap-3">
              {donationTrustPoints.map((item) => (
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

        <div className="grid gap-6 md:grid-cols-2">
          {donationUses.map((item) => (
            <SurfaceCard className="p-7" key={item}>
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                  Campaign use
                </p>
                <p className="text-base leading-7 text-white">{item}</p>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,213,160,0.18),transparent_32%),radial-gradient(circle_at_left,rgba(113,136,255,0.2),transparent_34%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow">Support now</span>
            <h2 className="display-font text-4xl leading-none text-white sm:text-5xl">
              Help the campaign move faster, communicate better, and show up stronger across the district.
            </h2>
            <p className="text-base leading-8 text-[var(--text-muted)]">
              A premium fundraising experience should never hide the ask. It should make the ask
              feel more trustworthy and easier to act on.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={donorPaths[0].href} size="lg">
              {donorPaths[0].ctaLabel}
            </ButtonLink>
            <ButtonLink href={donorPaths[1].href} size="lg" variant="secondary">
              {donorPaths[1].ctaLabel}
            </ButtonLink>
            <ButtonLink href="/volunteer" size="lg" variant="ghost">
              Volunteer instead
            </ButtonLink>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
