import type { ReactNode } from "react";

import { SettingsSidebar } from "@/components/account/settings-sidebar";
import { accountRouteItems } from "@/lib/account/constants";
import type { AccountCapabilities, AccountUserSummary } from "@/lib/account/types";

type AccountShellProps = {
  capabilities: AccountCapabilities;
  children: ReactNode;
  user: AccountUserSummary;
};

export function AccountShell({ capabilities, children, user }: AccountShellProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <SettingsSidebar capabilities={capabilities} items={accountRouteItems} />

      <div className="grid gap-6">
        <div className="app-shell rounded-[34px] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <span className="brandbuild-kicker">Enterprise account center</span>
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                  Control your operator identity, devices, alerts, and data handling.
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
                  BrandBuild is an enterprise AI video generation platform powered by
                  Sora 2, Kling, and Higgsfield. These settings keep the account layer
                  just as disciplined as the creative workflow.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-slate-300">
              <p className="font-semibold text-white">{user.displayName}</p>
              <p className="mt-1 text-slate-400">{user.email ?? "No email on file"}</p>
              <p className="mt-2 text-xs tracking-[0.14em] text-slate-500 uppercase">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

