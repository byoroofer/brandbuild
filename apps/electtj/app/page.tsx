import { ActionGrid } from "@/components/site/action-grid";
import { StatBand } from "@/components/site/stat-band";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  actionLinks,
  coalitionCards,
  districtPriorities,
  donationTiers,
  donorPaths,
  heroProof,
  homeHighlights,
  homeStats,
  imageUrls,
  mediaMoments,
  pressHighlights,
  siteMeta,
  storyBeats,
  supporterPaths,
  trustPoints,
} from "@/lib/site-content";

export default function HomePage() {
  return (
    <div className="page-shell flex flex-col gap-20 sm:gap-24">
      <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-5">
            <span className="eyebrow">
              {siteMeta.title} | {siteMeta.districtLabel}
            </span>
            <div className="space-y-4">
              <h1 className="display-font max-w-4xl text-5xl leading-[0.94] text-white sm:text-6xl lg:text-7xl">
                North Texas deserves a representative who is present, prepared, and hard to buy.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text-muted)] sm:text-xl">
                TJ Ware is running for Congress with a story rooted in service, work, advocacy, and
                family. The site is built to make that credibility legible and turn support into
                action across TX-24.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/donate" size="lg">
              Donate now
            </ButtonLink>
            <ButtonLink href="/volunteer" size="lg" variant="secondary">
              Join the team
            </ButtonLink>
            <ButtonLink href={actionLinks.speakEmail} size="lg" variant="ghost">
              Invite TJ
            </ButtonLink>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-[var(--text-muted)]">
            <a className="transition hover:text-white" href={actionLinks.survey}>
              Take the voter survey
            </a>
            <a className="transition hover:text-white" href="/media">
              Review media and proof
            </a>
            <a className="transition hover:text-white" href="/cd-24">
              Explore district priorities
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {heroProof.map((item) => (
              <SurfaceCard className="p-5" key={item} tone="outline">
                <p className="text-sm font-semibold tracking-[0.02em] text-white">{item}</p>
              </SurfaceCard>
            ))}
          </div>
        </div>

        <SurfaceCard className="overflow-hidden p-4 sm:p-5">
          <div className="absolute inset-x-6 top-0 h-32 rounded-full bg-[radial-gradient(circle_at_top,rgba(243,213,160,0.24),transparent_64%)] blur-3xl" />
          <div className="relative grid gap-4">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10">
              <img
                alt="TJ Ware for Congress campaign portrait"
                className="h-[25rem] w-full object-cover sm:h-[33rem]"
                src={imageUrls.hero}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[0.92fr_1.08fr]">
              <SurfaceCard className="p-5" tone="light">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img
                      alt="ElectTJ campaign logo"
                      className="h-full w-full object-contain p-1.5"
                      src={imageUrls.logo}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
                      Campaign posture
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--text-dark)]">
                      High trust. Local focus.
                    </p>
                  </div>
                </div>
              </SurfaceCard>
              <SurfaceCard className="p-5" tone="outline">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                  Why it matters
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  The site is organized around credibility first, then conversion. That is what
                  makes a campaign feel serious instead of donation hungry.
                </p>
              </SurfaceCard>
            </div>
          </div>
        </SurfaceCard>
      </section>

      <StatBand items={homeStats} />

      <section className="grid gap-8">
        <SectionHeading
          description="The strongest campaign sites build confidence before they push a hard ask. This section makes the case for why this campaign deserves attention in the first place."
          eyebrow="Why this campaign lands"
          title="A cleaner case for credibility, local relevance, and disciplined action."
        />

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6 md:grid-cols-3">
            {homeHighlights.map((card) => (
              <SurfaceCard className="p-7" key={card.title}>
                <div className="space-y-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                    {card.eyebrow}
                  </p>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold leading-tight text-white">{card.title}</h2>
                    <p className="text-sm leading-7 text-[var(--text-muted)]">{card.description}</p>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>

          <SurfaceCard className="p-8 sm:p-10" tone="light">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
                  Quick proof
                </p>
                <h2 className="display-font text-4xl leading-none text-[var(--text-dark)]">
                  Reasons supporters do not have to guess who TJ is.
                </h2>
              </div>
              <div className="grid gap-3">
                {trustPoints.slice(0, 4).map((point) => (
                  <div
                    className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-[var(--text-dark-muted)] shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                    key={point}
                  >
                    {point}
                  </div>
                ))}
              </div>
              <ButtonLink href="/about-tj" variant="light">
                Read TJ's story
              </ButtonLink>
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <SurfaceCard className="overflow-hidden" tone="light">
          <img
            alt="TJ Ware meeting supporters and community leaders"
            className="h-full min-h-[25rem] w-full object-cover"
            src={imageUrls.summit}
          />
        </SurfaceCard>

        <div className="grid gap-6">
          <SectionHeading
            description="The best biography sections are not autobiography dumps. They are clean story beats that explain why a candidate feels serious and why that matters now."
            eyebrow="Campaign narrative"
            title="A story architecture built for supporters, donors, and undecided voters."
          />
          <div className="grid gap-6">
            {storyBeats.map((beat) => (
              <SurfaceCard className="p-7" key={beat.title}>
                <div className="space-y-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                    {beat.eyebrow}
                  </p>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-white">{beat.title}</h2>
                    <p className="text-sm leading-7 text-[var(--text-muted)]">{beat.description}</p>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="This campaign is strongest when the site makes it obvious who it is built for and what it is trying to fix in District 24."
          eyebrow="Built for TX-24"
          title="The campaign should feel like it belongs to real North Texas people, not a template."
        />

        <div className="grid gap-6 lg:grid-cols-4">
          {coalitionCards.map((card) => (
            <SurfaceCard className="p-7" key={card.title} tone="light">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
                  {card.eyebrow}
                </p>
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-[var(--text-dark)]">{card.title}</h2>
                  <p className="text-sm leading-7 text-[var(--text-dark-muted)]">{card.description}</p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {districtPriorities.map((priority) => (
            <SurfaceCard className="p-8" key={priority.title}>
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                  {priority.eyebrow}
                </p>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white">{priority.title}</h2>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">
                    {priority.description}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/cd-24" variant="secondary">
            Explore district focus
          </ButtonLink>
          <ButtonLink href="/policy" variant="ghost">
            Review policy priorities
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="Media and public proof should do more than fill space. They should build confidence fast and make the campaign feel visible, active, and worth taking seriously."
          eyebrow="Media and proof"
          title="Coverage, interviews, and public record presented with more authority."
        />

        <StatBand items={pressHighlights} />

        <div className="grid gap-6 lg:grid-cols-2">
          {mediaMoments.map((moment) => (
            <SurfaceCard className="p-8" key={moment.title}>
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                  {moment.outlet}
                </p>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white">{moment.title}</h2>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">{moment.summary}</p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/media" variant="secondary">
            Open the media page
          </ButtonLink>
          <ButtonLink href={actionLinks.liveMediaHub} variant="ghost">
            View current live archive
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="The strongest homepage action section does not throw everything at the visitor at once. It gives each support lane a clear purpose and cleaner hierarchy."
          eyebrow="Take action"
          title="Six clear ways to help the campaign build momentum."
        />
        <ActionGrid items={supporterPaths} />
      </section>

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,213,160,0.16),transparent_26%),radial-gradient(circle_at_left,rgba(113,136,255,0.18),transparent_36%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="eyebrow">Donate with confidence</span>
              <h2 className="display-font text-4xl leading-none text-white sm:text-5xl">
                Fund a serious district campaign without the cheap tactics.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
                The campaign already has trusted contribution routes in place. This rebuild simply
                makes the ask cleaner, more credible, and easier to act on.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {donorPaths.map((path) => (
                <SurfaceCard className="h-full p-5" key={path.title} tone="outline">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                      {path.eyebrow}
                    </p>
                    <h3 className="text-lg font-semibold text-white">{path.title}</h3>
                    <p className="text-sm leading-7 text-[var(--text-muted)]">{path.description}</p>
                    <ButtonLink href={path.href} variant="secondary">
                      {path.ctaLabel}
                    </ButtonLink>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {donationTiers.map((tier) => (
              <SurfaceCard className="p-6" key={tier.amount} tone="light">
                <div className="space-y-4">
                  <p className="display-font text-4xl leading-none text-[var(--text-dark)]">
                    {tier.amount}
                  </p>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-[var(--text-dark)]">{tier.title}</h3>
                    <p className="text-sm leading-7 text-[var(--text-dark-muted)]">
                      {tier.description}
                    </p>
                  </div>
                  <ButtonLink className="w-full" href={tier.href} variant="light">
                    {tier.ctaLabel}
                  </ButtonLink>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12" tone="light">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(113,136,255,0.14),transparent_30%),radial-gradient(circle_at_left,rgba(201,155,82,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow !text-[var(--text-dark-muted)] before:bg-[linear-gradient(90deg,rgba(90,102,127,0.85),transparent)]">
              Final step
            </span>
            <h2 className="display-font text-4xl leading-none text-[var(--text-dark)] sm:text-5xl">
              Help build a campaign platform that looks ready because it is ready.
            </h2>
            <p className="text-base leading-8 text-[var(--text-dark-muted)]">
              Donate, join the team, invite TJ, or tell the campaign what matters most in your part
              of District 24.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/volunteer" size="lg" variant="light">
              Volunteer
            </ButtonLink>
            <ButtonLink href={actionLinks.survey} size="lg" variant="secondary">
              Take the survey
            </ButtonLink>
            <ButtonLink href={actionLinks.speakEmail} size="lg" variant="ghost">
              Invite TJ
            </ButtonLink>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
