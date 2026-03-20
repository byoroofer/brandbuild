import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  actionLinks,
  districtCommunities,
  districtPriorities,
  imageUrls,
  siteMeta,
} from "@/lib/site-content";

const districtSignals = [
  {
    label: "Local relevance",
    description:
      "The page should make it obvious that the campaign is speaking to actual communities in District 24, not broadcasting generic national copy.",
  },
  {
    label: "Serious priorities",
    description:
      "Voters, donors, and press need a fast read on what this campaign wants to fix for families, employers, and neighborhoods.",
  },
  {
    label: "Easy next step",
    description:
      "The strongest district pages do not stop at storytelling. They route people into survey, events, and direct outreach without friction.",
  },
];

export default function DistrictPage() {
  return (
    <div className="page-shell flex flex-col gap-20">
      <section className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-6">
            <SectionHeading
              description="This district page is rebuilt to do two jobs at once: prove local relevance to voters while still feeling credible to donors, press, and coalition partners."
              eyebrow={siteMeta.districtLabel}
              title="North Texas deserves representation that feels present, prepared, and impossible to dismiss."
            />
            <p className="prose-copy text-base">
              The new structure reframes the district story around affordability, practical growth,
              infrastructure resilience, and public trust. It removes builder-grade clutter and
              replaces it with a clearer local narrative, better scanability, and stronger action
              paths on every screen size.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={actionLinks.survey}>Take the voter survey</ButtonLink>
              <ButtonLink href="/events" variant="secondary">
                See event paths
              </ButtonLink>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="overflow-hidden" tone="light">
          <img
            alt="TJ Ware with community members in Texas District 24"
            className="h-full min-h-[24rem] w-full object-cover"
            src={imageUrls.district}
          />
        </SurfaceCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {districtSignals.map((item) => (
          <SurfaceCard className="p-8" key={item.label}>
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                District standard
              </p>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-white">{item.label}</h2>
                <p className="text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="The live site already names the communities across the seat. The rebuild turns that information into a cleaner visual signal of breadth and local presence."
          eyebrow="Communities in focus"
          title="This campaign is built for a real district with real places, not one narrow lane of voters."
        />

        <SurfaceCard className="p-8 sm:p-10" tone="light">
          <div className="flex flex-wrap gap-3">
            {districtCommunities.map((community) => (
              <span
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[var(--text-dark)] shadow-[0_12px_20px_rgba(15,23,42,0.04)]"
                key={community}
              >
                {community}
              </span>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {districtPriorities.map((item) => (
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

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(113,136,255,0.18),transparent_32%),radial-gradient(circle_at_right,rgba(243,213,160,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow">District voice</span>
            <h2 className="display-font text-4xl leading-none text-white sm:text-5xl">
              Tell the campaign what families, employers, and neighborhoods in TX-24 need most.
            </h2>
            <p className="text-base leading-8 text-[var(--text-muted)]">
              A premium campaign site should feel collaborative, not just declarative. The survey,
              speaking-request path, and events funnel all stay one click away so the district page
              moves visitors from interest into action.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={actionLinks.survey}>Take the survey</ButtonLink>
            <ButtonLink href={actionLinks.speakEmail} variant="secondary">
              Invite TJ to speak
            </ButtonLink>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
