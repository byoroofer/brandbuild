import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { actionLinks } from "@/lib/site-content";

const hostingOptions = [
  {
    title: "Invite TJ to speak",
    description:
      "Community organizations, civic groups, neighborhood hosts, and values-aligned coalitions can use the new site to request a conversation quickly.",
  },
  {
    title: "Host a supporter gathering",
    description:
      "Small house events and district meetups help the campaign feel present, local, and easier to trust than a candidate who only shows up for major stages.",
  },
  {
    title: "Coordinate volunteers",
    description:
      "Use the volunteer page to pair event attendance with outreach, visibility, and post-event follow-through.",
  },
];

export default function EventsPage() {
  return (
    <div className="page-shell flex flex-col gap-20">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-6">
            <SectionHeading
              description="The current events page is mostly an invitation prompt. The new version keeps that conversion goal, then wraps it in a more premium event and coalition surface."
              eyebrow="Events"
              title="A smarter events page that works even before a public calendar is packed."
            />
            <p className="prose-copy text-base">
              This is a good place to be intentional: when there are no public events yet, the page
              should still feel alive, useful, and conversion-ready rather than unfinished.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={actionLinks.speakEmail} variant="secondary">
                Invite TJ to speak
              </ButtonLink>
              <ButtonLink href="/volunteer" variant="ghost">
                Volunteer for events
              </ButtonLink>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-8 sm:p-10" tone="light">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
              Current status
            </p>
            <h2 className="display-font text-4xl leading-none text-[var(--text-dark)]">
              Public events calendar coming soon.
            </h2>
            <p className="text-base leading-8 text-[var(--text-dark-muted)]">
              Until the live calendar is publishing scheduled stops, the strongest call to action is
              still a direct speaking invitation, volunteer coordination, or local host request.
            </p>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {hostingOptions.map((item) => (
          <SurfaceCard className="p-8" key={item.title}>
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                Coalition building
              </p>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="p-10 sm:p-12" tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
            Empty state, upgraded
          </p>
          <h2 className="display-font mt-4 text-4xl leading-none text-[var(--text-dark)] sm:text-5xl">
            No public event listed yet does not mean no next step.
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--text-dark-muted)]">
            A premium campaign handles this gracefully. Ask for a speaking appearance, offer to host
            a gathering, or join the volunteer bench so the next event is easier to launch fast.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={actionLinks.speakEmail} variant="light">
              Invite TJ
            </ButtonLink>
            <ButtonLink href="/volunteer" variant="secondary">
              Join event volunteers
            </ButtonLink>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
