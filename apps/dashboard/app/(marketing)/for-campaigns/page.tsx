import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureCard } from "@/components/marketing/feature-card";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";

const featureCards = [
  {
    kicker: "Vetting",
    title: "Start with cleaner creator readiness",
    description:
      "Collect structured creator profiles instead of juggling scattered bios, platform notes, and email threads.",
  },
  {
    kicker: "Briefing",
    title: "Align your asks around real campaign outputs",
    description:
      "Creator videos, persuasion content, interview clips, opinion takes, promo assets, and tracked actions all belong in one campaign operating flow.",
  },
  {
    kicker: "Program ops",
    title: "Build a creator program that feels intentional",
    description:
      "Give campaign teams a polished shell for organization, onboarding, and future expansion without becoming a generic influencer tool.",
  },
];

export default function ForCampaignsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <PageHero
        badge="For campaigns"
        description="PolitiViral is designed for campaign teams that need a premium creator activation layer, not a broad marketplace. It gives you a cleaner system for briefing, organizing, and preparing creator workstreams that move voters."
        primaryAction={{ href: "/signup", label: "Set up your campaign" }}
        secondaryAction={{ href: "/pricing", label: "View pilot pricing" }}
        stats={[
          {
            label: "Use cases",
            value: "Persuasion videos, opinion content, interview formats, promo content, and tracked action links.",
          },
          {
            label: "Audience",
            value: "Democratic and center-left candidates, PACs, advocacy groups, and aligned organizations.",
          },
          {
            label: "Direction",
            value: "Simple enough for rapid launch, polished enough to feel trustworthy in front of stakeholders.",
          },
        ]}
        title="A creator activation system built for political teams that need polish."
      />

      <section className="grid gap-10">
        <SectionHeading
          description="Milestone 1 focuses on the early operating layer your team needs before deep collaboration and billing workflows come online."
          eyebrow="Why it matters"
          title="Campaign-ready structure before the outreach chaos starts."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <FeatureCard
              description={card.description}
              kicker={card.kicker}
              key={card.title}
              title={card.title}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
        <div className="grid gap-6">
          <SurfaceCard className="p-8">
            <h2 className="display-font text-4xl leading-none text-slate-950">What your team gets in milestone 1</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <li>A campaign-specific onboarding flow that captures organization, initiative, budget range, and activation timeline.</li>
              <li>A dashboard shell tuned for creator program visibility instead of generic creator marketplace browsing.</li>
              <li>A cleaner starting point for future invite, brief, and tracked-link workflows.</li>
            </ul>
          </SurfaceCard>
        </div>

        <SurfaceCard className="p-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
              Pilot fit
            </span>
            <p className="text-sm leading-7 text-slate-600">
              PolitiViral is especially strong for teams that already believe creators matter but need a more credible operating layer to scale the work.
            </p>
          </div>
        </SurfaceCard>
      </section>

      <CtaBand
        actionHref="/signup"
        actionLabel="Create campaign account"
        description="Start with campaign onboarding, lock in your creator program basics, and get a dashboard shell designed for political operations."
        eyebrow="Campaign launch"
        title="Give your creator strategy a product surface that matches the stakes."
      />
    </div>
  );
}
