import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { actionLinks, merchHighlights } from "@/lib/site-content";

export default function MerchPage() {
  return (
    <div className="page-shell flex flex-col gap-20">
      <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-6">
            <SectionHeading
              description="Campaign merch is one of the easiest places for a site to feel cheap. This rebuild tightens the layout, clarifies the options, and makes the sign request pathway feel much more credible."
              eyebrow="Campaign merch"
              title="Cleaner merch presentation, stronger sign-up path, better perceived quality."
            />
            <p className="prose-copy text-base">
              The goal is not to mimic a generic ecommerce template. It is to present campaign gear
              as part of a serious supporter experience with fast decisions and minimal clutter.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={actionLinks.requestSign}>Request a yard sign</ButtonLink>
              <ButtonLink href="/donate" variant="secondary">
                Support campaign costs
              </ButtonLink>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-8 sm:p-10" tone="light">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
              Current offer
            </p>
            <h2 className="display-font text-4xl leading-none text-[var(--text-dark)]">
              Yard signs available with free DFW delivery.
            </h2>
            <p className="text-base leading-8 text-[var(--text-dark-muted)]">
              The live site suggests $25 to $50 donations to help cover campaign costs while keeping
              sign requests accessible.
            </p>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {merchHighlights.map((item) => (
          <SurfaceCard className="p-8" key={item.title}>
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                Merch lane
              </p>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12" tone="light">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,155,82,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(216,77,99,0.12),transparent_26%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow !text-[var(--text-dark-muted)] before:bg-[linear-gradient(90deg,rgba(90,102,127,0.85),transparent)]">
              Visibility matters
            </span>
            <h2 className="display-font text-4xl leading-none text-[var(--text-dark)] sm:text-5xl">
              Put the campaign on lawns, at events, and in the district conversation.
            </h2>
            <p className="text-base leading-8 text-[var(--text-dark-muted)]">
              Yard signs, shirts, and supporter gear should all feel like a coordinated extension of
              the brand, not an afterthought.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={actionLinks.requestSign} variant="light">
              Request a sign
            </ButtonLink>
            <ButtonLink href={actionLinks.merchHub} variant="secondary">
              View current live merch hub
            </ButtonLink>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
