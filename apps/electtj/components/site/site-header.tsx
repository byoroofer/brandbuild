"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import {
  actionLinks,
  imageUrls,
  primaryNavigation,
  siteMeta,
  utilityNavigation,
} from "@/lib/site-content";

function cx(...parts: Array<string | false>) {
  return parts.filter(Boolean).join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(8,13,26,0.76)] backdrop-blur-2xl">
      <div className="border-b border-white/6">
        <div className="page-shell flex flex-wrap items-center justify-between gap-3 py-3 text-[0.68rem] font-semibold tracking-[0.2em] text-[var(--text-muted)] uppercase">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <span>{siteMeta.districtLabel}</span>
          </div>
          <div className="hidden items-center gap-5 lg:flex">
            <a className="transition hover:text-white" href={actionLinks.survey}>
              Voter survey
            </a>
            <a className="transition hover:text-white" href={actionLinks.speakEmail}>
              Invite TJ
            </a>
            <a className="transition hover:text-white" href={`mailto:${siteMeta.email}`}>
              {siteMeta.email}
            </a>
          </div>
          <a className="transition hover:text-white" href={siteMeta.phoneHref}>
            {siteMeta.phoneLabel}
          </a>
        </div>
      </div>

      <div className="page-shell flex items-center justify-between gap-4 py-4">
        <Link className="group flex min-w-0 items-center gap-4" href="/">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(243,213,160,0.24)] bg-[linear-gradient(145deg,rgba(243,213,160,0.12),rgba(255,255,255,0.04))] shadow-[0_18px_36px_rgba(0,0,0,0.22)] transition group-hover:-translate-y-0.5">
            <img
              alt="ElectTJ campaign logo"
              className="h-full w-full object-contain p-1.5"
              src={imageUrls.logo}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.68rem] font-semibold tracking-[0.26em] text-[var(--gold-soft)] uppercase">
              ElectTJ
            </p>
            <p className="display-font truncate text-xl leading-none text-white sm:text-2xl">
              TJ Ware for Congress
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {primaryNavigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                className={cx(
                  "rounded-full px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-[var(--text-muted)] hover:bg-white/6 hover:text-white",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {utilityNavigation.map((item) => (
            <Link
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-white/6 hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href={actionLinks.survey} size="sm" variant="ghost">
            Survey
          </ButtonLink>
          <ButtonLink href="/volunteer" size="sm" variant="secondary">
            Join
          </ButtonLink>
          <ButtonLink href="/donate" size="sm">
            Donate
          </ButtonLink>
        </div>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white transition hover:bg-white/10 lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span className="flex flex-col gap-1.5">
            <span
              className={cx("h-0.5 w-5 bg-current transition", isOpen && "translate-y-2 rotate-45")}
            />
            <span className={cx("h-0.5 w-5 bg-current transition", isOpen && "opacity-0")} />
            <span
              className={cx("h-0.5 w-5 bg-current transition", isOpen && "-translate-y-2 -rotate-45")}
            />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-white/8 bg-[rgba(8,13,26,0.96)] lg:hidden">
          <div className="page-shell flex flex-col gap-3 py-4">
            {primaryNavigation.map((item) => (
              <Link
                className={cx(
                  "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                  pathname === item.href
                    ? "border-[rgba(243,213,160,0.28)] bg-white/10 text-white"
                    : "border-white/8 bg-white/4 text-[var(--text-muted)] hover:border-white/14 hover:text-white",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}

            <div className="grid gap-3 pt-1 sm:grid-cols-2">
              {utilityNavigation.map((item) => (
                <Link
                  className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:border-white/14 hover:text-white"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <ButtonLink href={actionLinks.survey} variant="ghost">
                Take survey
              </ButtonLink>
              <ButtonLink href="/volunteer" variant="secondary">
                Join the team
              </ButtonLink>
            </div>
            <ButtonLink href={actionLinks.speakEmail} variant="secondary">
              Invite TJ
            </ButtonLink>
            <ButtonLink href="/donate">Donate</ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
