import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { actionLinks, volunteerSteps, volunteerTracks } from "@/lib/site-content";

export default function VolunteerPage() {
  return (
    <div className="page-shell flex flex-col gap-20">
      <section className="grid gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
        <SurfaceCard className="p-8 sm:p-10">
          <div className="space-y-6">
            <SectionHeading
              description="The live site already has a volunteer and staff application. The rebuild gives it a higher-trust wrapper and a much clearer picture of where people fit."
              eyebrow="Volunteer"
              title="A stronger volunteer funnel starts with clearer roles and a more premium first impression."
            />
            <p className="prose-copy text-base">
              When supporters land here, the goal is to reduce hesitation. The page now makes the
              mission, the volunteer lanes, and the next step immediately obvious.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={actionLinks.volunteer}>Apply now</ButtonLink>
              <ButtonLink href="/events" variant="secondary">
                Support events
              </ButtonLink>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-4">
          {volunteerSteps.map((step, index) => (
            <SurfaceCard className="p-6" key={step.title} tone="light">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--text-dark-muted)] uppercase">
                Step {index + 1}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text-dark)]">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-dark-muted)]">
                {step.description}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="grid gap-8">
        <SectionHeading
          description="The new page keeps the public ask simple while giving supporters enough specificity to picture themselves helping."
          eyebrow="Where volunteers fit"
          title="Multiple lanes, one cleaner campaign entry point."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {volunteerTracks.map((track) => (
            <SurfaceCard className="p-8" key={track.title}>
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
                  Volunteer lane
                </p>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-white">{track.title}</h3>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">{track.description}</p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <SurfaceCard className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,77,99,0.18),transparent_30%),radial-gradient(circle_at_left,rgba(201,155,82,0.16),transparent_28%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="eyebrow">Join the campaign</span>
            <h2 className="display-font text-4xl leading-none text-white sm:text-5xl">
              Ready to help build visibility, momentum, and turnout?
            </h2>
            <p className="text-base leading-8 text-[var(--text-muted)]">
              The application is already live. The redesign simply makes the ask feel more premium,
              more intentional, and easier to trust.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={actionLinks.volunteer} size="lg">
              Open application
            </ButtonLink>
            <ButtonLink href="/donate" size="lg" variant="secondary">
              Can't volunteer? Donate
            </ButtonLink>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
