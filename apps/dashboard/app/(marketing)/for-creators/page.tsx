import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureCard } from "@/components/marketing/feature-card";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";

const creatorFeatures = [
  {
    kicker: "Readiness",
    title: "Show campaigns how you fit",
    description:
      "Your onboarding profile captures the essentials campaigns need to evaluate political fit and creator readiness without making you fill out a generic marketplace profile.",
  },
  {
    kicker: "Clarity",
    title: "Work from cleaner campaign asks",
    description:
      "PolitiViral is built for briefs and workflows tied to persuasion, opinion, interview, promo, and action content, not lifestyle brand sponsorships.",
  },
  {
    kicker: "Momentum",
    title: "Build repeat political partnerships",
    description:
      "Start with a premium creator dashboard shell that prepares you for recurring campaign work as the product expands.",
  },
];

export default function ForCreatorsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <PageHero
        badge="For creators"
        description="PolitiViral helps creators join political programs through a workflow that feels organized, credible, and built for real campaign collaboration."
        primaryAction={{ href: "/signup", label: "Join as a creator" }}
        secondaryAction={{ href: "/for-campaigns", label: "See the campaign side" }}
        stats={[
          {
            label: "Built for",
            value: "Creators who want to work with campaigns, advocacy groups, and center-left political organizations.",
          },
          {
            label: "Not built for",
            value: "A broad influencer marketplace with every brand category and every sponsorship format mixed together.",
          },
          {
            label: "First milestone",
            value: "Creator onboarding, creator dashboard shell, and a clearer bridge into campaign work.",
          },
        ]}
        title="A political creator profile that feels campaign-ready from day one."
      />

      <section className="grid gap-10">
        <SectionHeading
          description="The creator side of PolitiViral is meant to feel polished and serious enough for campaign work without becoming heavy or overbuilt."
          eyebrow="Creator side"
          title="Less generic influencer tooling, more campaign-fit clarity."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {creatorFeatures.map((card) => (
            <FeatureCard
              description={card.description}
              kicker={card.kicker}
              key={card.title}
              title={card.title}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard className="p-8">
          <div className="space-y-4">
            <h2 className="display-font text-4xl leading-none text-slate-950">What you share in onboarding</h2>
            <ul className="space-y-3 text-sm leading-7 text-slate-600">
              <li>Display name and primary platform</li>
              <li>Content focus and audience size</li>
              <li>Home base and a short creator bio</li>
            </ul>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-8">
          <div className="space-y-4">
            <h2 className="display-font text-4xl leading-none text-slate-950">What you get back</h2>
            <ul className="space-y-3 text-sm leading-7 text-slate-600">
              <li>A creator dashboard shell shaped for political campaign collaboration</li>
              <li>A cleaner entry point into future campaign briefs and approvals</li>
              <li>A profile system that feels more premium than ad hoc creator intake</li>
            </ul>
          </div>
        </SurfaceCard>
      </section>

      <CtaBand
        actionHref="/signup"
        actionLabel="Create creator account"
        description="Join the creator side of PolitiViral, complete your onboarding, and land in a dashboard built for political collaboration."
        eyebrow="Creator launch"
        title="Make your first impression feel like campaign work, not generic creator marketplace noise."
      />
    </div>
  );
}
