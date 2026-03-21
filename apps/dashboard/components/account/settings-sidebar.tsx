"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AccountCapabilities, AccountRouteItem } from "@/lib/account/types";
import { cx } from "@/lib/utils";

type SettingsSidebarProps = {
  capabilities: AccountCapabilities;
  items: AccountRouteItem[];
};

function getCapabilitySummary(capabilities: AccountCapabilities) {
  return [
    capabilities.hasTeams ? "Team-ready controls" : null,
    capabilities.hasBilling ? "Billing-aware notices" : null,
    capabilities.hasDataExport ? "Data export enabled" : null,
    capabilities.hasAccountDeletion ? "Deletion safeguards" : null,
  ].filter(Boolean) as string[];
}

export function SettingsSidebar({ capabilities, items }: SettingsSidebarProps) {
  const pathname = usePathname();
  const capabilitySummary = getCapabilitySummary(capabilities);

  return (
    <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
      <div className="app-shell rounded-[30px] p-4 sm:p-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="brandbuild-kicker">Account OS</span>
            <div>
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Security, notifications, privacy, and operator preferences built for
                enterprise AI video teams.
              </p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
            {items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  className={cx(
                    "min-w-[10rem] rounded-2xl border px-4 py-3 text-left text-sm font-medium transition lg:min-w-0",
                    isActive
                      ? "border-amber-300/30 bg-amber-300/10 text-white shadow-[0_18px_40px_rgba(245,197,126,0.14)]"
                      : "border-white/8 bg-white/[0.035] text-slate-300 hover:border-white/14 hover:bg-white/[0.06] hover:text-white",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <span className="block">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-black/20 p-4">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-white/46 uppercase">
          Deployment flags
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {capabilitySummary.map((item) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-white/72 uppercase"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

