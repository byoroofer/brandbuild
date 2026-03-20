"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { CommandBar } from "@/components/dashboard/command-bar";
import { StatusPill } from "@/components/studio/status-pill";
import { cx } from "@/lib/utils";
import type { WorkspaceMode } from "@/lib/studio/types";

type DashboardShellProps = {
  children: ReactNode;
  mode?: WorkspaceMode;
};

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/campaigns", label: "Campaigns" },
  { href: "/dashboard/shots", label: "Shots" },
  { href: "/dashboard/assets", label: "Assets" },
  { href: "/dashboard/reviews", label: "Reviews" },
];

export function DashboardShell({ children, mode = "demo" }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="app-shell rounded-[30px] p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-violet-100 uppercase">
                Studio OS
              </span>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">AI Video Studio</h2>
                <p className="text-sm leading-6 text-slate-400">
                  Internal operating system for planning, generating, organizing, and reviewing AI marketing videos.
                </p>
              </div>
              <StatusPill label={mode === "live" ? "Live data" : "Demo data"} tone={mode === "live" ? "success" : "warning"} />
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    className={cx(
                      "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "border-violet-400/40 bg-violet-500/14 text-white shadow-[0_18px_40px_rgba(139,92,246,0.18)]"
                        : "border-white/8 bg-white/4 text-slate-300 hover:border-white/14 hover:bg-white/7 hover:text-white",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[24px] border border-cyan-400/18 bg-cyan-400/8 p-4 text-sm text-cyan-100">
              <p className="font-semibold">Routing defaults</p>
              <p className="mt-2 leading-6 text-cyan-50/85">
                Sora for polished hero shots, Kling for controlled motion and character beats, Higgsfield for exploratory cinematic work.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="grid gap-6">
        <CommandBar mode={mode} />
        {children}
      </div>
    </div>
  );
}
