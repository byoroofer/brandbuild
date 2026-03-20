import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { actionLinks, imageUrls, socialLinks, siteMeta } from "@/lib/site-content";

const footerNavigation = [
  { href: "/about-tj", label: "About TJ" },
  { href: "/policy", label: "Policy" },
  { href: "/cd-24", label: "District 24" },
  { href: "/media", label: "Media" },
  { href: "/events", label: "Events" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/campaign-merch", label: "Merch" },
  { href: "/donate", label: "Donate" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/8 bg-[rgba(8,13,26,0.9)]">
      <div className="page-shell grid gap-10 py-12 xl:grid-cols-[1.2fr_0.85fr_0.9fr_0.9fr]">
        <div className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(243,213,160,0.24)] bg-[linear-gradient(145deg,rgba(243,213,160,0.12),rgba(255,255,255,0.04))]">
                <img
                  alt="ElectTJ campaign logo"
                  className="h-full w-full object-contain p-1.5"
                  src={imageUrls.logo}
                />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-[var(--gold-soft)] uppercase">
                  ElectTJ
                </p>
                <p className="display-font text-2xl leading-none text-white">TJ Ware for Congress</p>
              </div>
            </div>
            <h2 className="display-font max-w-xl text-3xl leading-none text-white sm:text-4xl">
              A cleaner, more credible campaign platform for winning trust in North Texas.
            </h2>
            <p className="max-w-xl text-base leading-8 text-[var(--text-muted)]">
              The rebuild keeps the campaign's story and action paths intact, then presents them
              with stronger hierarchy, clearer credibility, and a much more premium conversion flow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/donate" size="sm">
              Donate
            </ButtonLink>
            <ButtonLink href="/volunteer" size="sm" variant="secondary">
              Join the team
            </ButtonLink>
            <ButtonLink href={actionLinks.speakEmail} size="sm" variant="ghost">
              Invite TJ
            </ButtonLink>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
            Explore
          </p>
          <div className="grid gap-3">
            {footerNavigation.map((item) => (
              <Link
                className="text-sm text-[var(--text-muted)] transition hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
            Take action
          </p>
          <div className="grid gap-3 text-sm text-[var(--text-muted)]">
            <a className="transition hover:text-white" href={actionLinks.survey}>
              Take the voter survey
            </a>
            <a className="transition hover:text-white" href={actionLinks.requestSign}>
              Request yard signs
            </a>
            <a className="transition hover:text-white" href={actionLinks.volunteer}>
              Open volunteer application
            </a>
            <a className="transition hover:text-white" href={actionLinks.liveMediaHub}>
              View live media archive
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
            Contact and follow
          </p>
          <div className="grid gap-3 text-sm text-[var(--text-muted)]">
            <a className="transition hover:text-white" href={`mailto:${siteMeta.email}`}>
              {siteMeta.email}
            </a>
            <a className="transition hover:text-white" href={siteMeta.phoneHref}>
              {siteMeta.phoneLabel}
            </a>
            {socialLinks.map((link) => (
              <a
                className="transition hover:text-white"
                href={link.href}
                key={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="page-shell flex flex-col gap-3 py-4 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <p>Copyright (c) 2026 ElectTJ. All rights reserved.</p>
          <p>
            Official campaign website for {siteMeta.title} | {siteMeta.districtLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}
