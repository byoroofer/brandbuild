"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandbuildLogo } from "@/components/site/brandbuild-logo";

const navigationItems = [
  { href: "#platform", label: "Platform" },
  { href: "#workflow", label: "Workflow" },
  { href: "#control-room", label: "Control room" },
  { href: "#enterprise", label: "Enterprise" },
];

const hiddenPrefixes = [
  "/account",
  "/campaign",
  "/creator",
  "/dashboard",
  "/login",
  "/reset-password",
  "/roof-measure",
  "/signup",
];

function shouldHideSiteChrome(pathname: string) {
  return hiddenPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  if (shouldHideSiteChrome(pathname)) {
    return null;
  }

  const prefix = pathname === "/" ? "" : "/";

  return (
    <header className="pointer-events-none sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/10 bg-[rgba(7,9,14,0.72)] px-3 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        <Link
          className="flex items-center gap-3 rounded-full px-2 py-1.5 transition hover:bg-white/5"
          href="/"
        >
          <BrandbuildLogo
            alt="BrandBuild home"
            className="h-10 w-auto sm:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navigationItems.map((item) => (
            <Link
              className="rounded-full px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/6 hover:text-white"
              href={`${prefix}${item.href}`}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/58 transition hover:bg-white/5 hover:text-white sm:inline-flex"
            href="/login"
          >
            Log in
          </Link>
          <Link className="brandbuild-primary-button h-11 px-5 text-sm" href="/dashboard">
            Enter dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
