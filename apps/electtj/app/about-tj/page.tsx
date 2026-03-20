import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  aboutMilestones,
  actionLinks,
  coalitionCards,
  homeHighlights,
  imageUrls,
  storyBeats,
  trustPoints,
} from "@/lib/site-content";

export default function AboutPage() {
  return (
    <div className="page-shell flex flex-col gap-20">
      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <SurfaceCard className="overflow-hidden">
          <img
            alt="TJ Ware portrait"
            className="h-full min-h-[25rem] w-full object-cover"
            src={imageUrls.hero}
          />
        </SurfaceCard>

        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-6">
            <SectionHeading
              description="TJ Ware's public story spans blue-collar work, early public-service exposure, the Marine Corps, aviation, entrepreneurship, disaster response, and consumer advocacy."
              eyebrow="About TJ"
              title="A candidate biography that reads like earned leadership, not political packaging."
            />
            <p className="prose-copy text-base">
              The strongest version of the story is not a wall of text. It is a sequence of proof
              points that explain why this campaign feels grounded, credible, and prepared to
              represent District 24 with more seriousness than a generic candidate site ever could.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/donate" variant="secondary">
                Support the campaign
              </ButtonLink>
              <ButtonLink href="/media" variant="ghost">
                Review public proof
              </ButtonLink>
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {homeHighlights.map((item) => (
          <SurfaceCard className="p-7" key={item.title} tone="light">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
                {item.eyebrow}
              </p>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">{item.title}</h2>
                <p className="text-sm leading-7 text-[var(--text-dark-muted)]">{item.description}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="The about page works best when it moves through a few clear chapters instead of making supporters decode a long biography on their own."
          eyebrow="Story structure"
          title="A tighter editorial arc from roots to public service."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {storyBeats.map((beat) => (
            <SurfaceCard className="p-7" key={beat.title} tone="light">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
                  {beat.eyebrow}
                </p>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-[var(--text-dark)]">{beat.title}</h2>
                  <p className="text-sm leading-7 text-[var(--text-dark-muted)]">
                    {beat.description}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {aboutMilestones.map((item) => (
          <SurfaceCard className="p-8" key={item.title}>
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                {item.eyebrow}
              </p>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
                <p className="text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <SurfaceCard className="overflow-hidden" tone="light">
          <img
            alt="TJ Ware at community and industry events"
            className="h-full min-h-[22rem] w-full object-cover"
            src={imageUrls.summit}
          />
        </SurfaceCard>

        <SurfaceCard className="p-8 sm:p-10" tone="light">
          <div className="space-y-6">
            <SectionHeading
              description="Trust gets stronger when biography turns into legible proof. This stack is designed to make that proof fast to scan and hard to dismiss."
              eyebrow="Credibility at a glance"
              title="The proof behind the campaign voice."
            />
            <div className="grid gap-4">
              {trustPoints.map((point) => (
                <div
                  className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-[var(--text-dark-muted)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                  key={point}
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="The biography matters because it points toward who this campaign is trying to represent and how it approaches the job."
          eyebrow="What this background brings"
          title="The values and constituencies the story naturally speaks to."
        />

        <div className="grid gap-6 lg:grid-cols-4">
          {coalitionCards.map((card) => (
            <SurfaceCard className="p-7" key={card.title}>
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                  {card.eyebrow}
                </p>
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-white">{card.title}</h2>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">{card.description}</p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(243,213,160,0.18),transparent_34%),radial-gradient(circle_at_left,rgba(216,77,99,0.16),transparent_26%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow">Next step</span>
            <h2 className="display-font text-4xl leading-none text-white sm:text-5xl">
              A better candidate story should lead naturally into support.
            </h2>
            <p className="text-base leading-8 text-[var(--text-muted)]">
              Back the campaign, request signs, or invite TJ into a local conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/donate">Donate</ButtonLink>
            <ButtonLink href="/campaign-merch" variant="secondary">
              Request signs
            </ButtonLink>
            <ButtonLink href={actionLinks.speakEmail} variant="ghost">
              Invite TJ
            </ButtonLink>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
