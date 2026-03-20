import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";

const pricingCards = [
  {
    title: "Creator",
    price: "Free",
    description:
      "Join the platform, complete creator onboarding, and maintain a campaign-ready profile.",
    points: [
      "Creator onboarding",
      "Creator dashboard shell",
      "Prepared for future briefs and invites",
    ],
  },
  {
    title: "Campaign pilot",
    price: "Contact us",
    description:
      "For teams launching creator operations and needing a premium foundation without generic marketplace clutter.",
    points: [
      "Campaign onboarding",
      "Campaign dashboard shell",
      "Foundational creator program setup",
    ],
  },
  {
    title: "Coordinated program",
    price: "Custom",
    description:
      "For larger campaign organizations, PACs, and advocacy groups that want a deeper partnership as the platform expands.",
    points: [
      "Pilot planning support",
      "Expansion path for creator workflows",
      "Vercel and Supabase-ready product foundation",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <PageHero
        badge="Pricing"
        description="Milestone 1 includes polished pricing presentation, but live billing is intentionally out of scope for this batch. Campaign plans are still handled as pilot or custom arrangements."
        primaryAction={{ href: "/signup", label: "Create account" }}
        secondaryAction={{ href: "/for-campaigns", label: "See campaign fit" }}
        stats={[
          {
            label: "Creator access",
            value: "Creators can join the platform and complete onboarding without a paid plan in milestone 1.",
          },
          {
            label: "Campaign plans",
            value: "Campaign pricing is positioned as pilot or custom while the billing layer is held for a later milestone.",
          },
          {
            label: "Why this matters",
            value: "The product looks polished now without pretending the Stripe stack is already wired end to end.",
          },
        ]}
        title="Simple, credible pricing for an early premium political SaaS."
      />

      <section className="grid gap-10">
        <SectionHeading
          description="The pricing posture stays honest: creator entry is easy, campaign partnerships are premium, and live billing comes later."
          eyebrow="Pricing posture"
          title="Position the product well now, wire live billing in a later batch."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingCards.map((card) => (
            <SurfaceCard className="flex h-full flex-col p-8" key={card.title}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-950">{card.title}</h2>
                  <p className="display-font text-5xl leading-none text-slate-950">{card.price}</p>
                  <p className="text-sm leading-6 text-slate-600">{card.description}</p>
                </div>

                <ul className="space-y-3 text-sm leading-6 text-slate-600">
                  {card.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <SurfaceCard className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="space-y-2">
          <h2 className="display-font text-4xl leading-none text-slate-950">Need campaign pricing context?</h2>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Use the campaign onboarding flow to establish fit now, then layer in full billing when the product reaches the Stripe milestone.
          </p>
        </div>
        <ButtonLink href="/signup" size="lg">
          Start onboarding
        </ButtonLink>
      </SurfaceCard>
    </div>
  );
}
