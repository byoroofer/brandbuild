import { StatBand } from "@/components/site/stat-band";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  actionLinks,
  imageUrls,
  mediaMoments,
  pressHighlights,
  siteMeta,
} from "@/lib/site-content";

const mediaAngles = [
  {
    title: "Service over theater",
    description:
      "The best coverage reinforces a candidate who is visible in moments of public pressure, not just present when politics gets performative.",
  },
  {
    title: "Operator fluency",
    description:
      "Long-form interviews matter because they make the campaign sound comfortable with details, tradeoffs, and real-world problem solving.",
  },
  {
    title: "Local relevance",
    description:
      "The media story gets stronger when it stays tied to North Texas concerns, community pressure points, and district-level realities.",
  },
];

export default function MediaPage() {
  return (
    <div className="page-shell flex flex-col gap-20">
      <section className="grid gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-6">
            <SectionHeading
              description="The public archive is deeper than the old presentation suggested. This version turns it into a more useful credibility surface for press, donors, and undecided visitors."
              eyebrow="Media and press"
              title="A cleaner stage for coverage, interviews, and campaign proof."
            />
            <p className="prose-copy text-base">
              Media gets more persuasive when it is curated. The redesign foregrounds the best
              proof points, reduces noise, and gives reporters a faster path to the campaign.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={actionLinks.pressEmail} variant="secondary">
                Press inquiry
              </ButtonLink>
              <ButtonLink href={actionLinks.liveMediaHub} variant="ghost">
                Open live archive
              </ButtonLink>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="overflow-hidden" tone="light">
          <img
            alt={`${siteMeta.title} media and campaign event photography`}
            className="h-full min-h-[24rem] w-full object-cover"
            src={imageUrls.summit}
          />
        </SurfaceCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {mediaAngles.map((item) => (
          <SurfaceCard className="p-8" key={item.title} tone="light">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
                Media signal
              </p>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">{item.title}</h2>
                <p className="text-sm leading-7 text-[var(--text-dark-muted)]">{item.description}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </section>

      <StatBand items={pressHighlights} />

      <section className="grid gap-8">
        <SectionHeading
          description="This section turns the live archive into a stronger editorial system instead of a loose stack of links and embeds."
          eyebrow="Coverage highlights"
          title="The most valuable public proof points, rewritten with more authority."
        />

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
      </section>

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12" tone="light">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(113,136,255,0.14),transparent_30%),radial-gradient(circle_at_left,rgba(201,155,82,0.16),transparent_28%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow !text-[var(--text-dark-muted)] before:bg-[linear-gradient(90deg,rgba(90,102,127,0.85),transparent)]">
              Press ready
            </span>
            <h2 className="display-font text-4xl leading-none text-[var(--text-dark)] sm:text-5xl">
              Need a quote, booking, or background conversation?
            </h2>
            <p className="text-base leading-8 text-[var(--text-dark-muted)]">
              The redesigned media page keeps outreach friction low while preserving a clear path
              to the campaign's live archive and public record.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={actionLinks.pressEmail} variant="light">
              Email the campaign
            </ButtonLink>
            <ButtonLink href={actionLinks.liveMediaHub} variant="secondary">
              Open live archive
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
