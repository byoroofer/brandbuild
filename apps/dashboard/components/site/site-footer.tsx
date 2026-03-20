"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const hiddenPrefixes = ["/campaign", "/creator", "/dashboard", "/login", "/roof-measure", "/signup"];

function shouldHideSiteChrome(pathname: string) {
  return hiddenPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function SiteFooter() {
  const pathname = usePathname();

  if (shouldHideSiteChrome(pathname)) {
    return null;
  }

  const prefix = pathname === "/" ? "" : "/";

  return (
    <footer className="px-4 pb-10 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[36px] border border-white/8 bg-[rgba(7,9,14,0.72)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_repeat(3,minmax(0,0.6fr))]">
          <div className="space-y-4">
            <span className="brandbuild-kicker">BrandBuild</span>
            <h2 className="max-w-md text-2xl font-semibold tracking-[-0.05em] text-white">
              The AI video operating system for multi-model creative teams.
            </h2>
            <p className="max-w-lg text-sm leading-7 text-white/56">
              Orchestrate Sora 2, Kling, and Higgsfield through one enterprise workflow for
              planning, generation, review, and final assembly.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-medium tracking-[0.22em] text-white/38 uppercase">
              Platform
            </p>
            <div className="grid gap-2 text-sm text-white/60">
              <Link className="transition hover:text-white" href={`${prefix}#platform`}>
                Model strengths
              </Link>
              <Link className="transition hover:text-white" href={`${prefix}#workflow`}>
                Workflow logic
              </Link>
              <Link className="transition hover:text-white" href={`${prefix}#control-room`}>
                Product preview
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-medium tracking-[0.22em] text-white/38 uppercase">
              Access
            </p>
            <div className="grid gap-2 text-sm text-white/60">
              <Link className="transition hover:text-white" href="/login">
                Log in
              </Link>
              <Link className="transition hover:text-white" href="/dashboard">
                Enter dashboard
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-medium tracking-[0.22em] text-white/38 uppercase">
              Guardrails
            </p>
            <div className="grid gap-2 text-sm text-white/60">
              <p>Keys stay server-side.</p>
              <p>Assets stay organized by shot.</p>
              <p>Review memory stays attached to every run.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/8 pt-5 text-xs tracking-[0.16em] text-white/34 uppercase">
          BrandBuild keeps the workflow cinematic on the surface and disciplined underneath.
        </div>
      </div>
    </footer>
  );
}
