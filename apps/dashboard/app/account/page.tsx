import Link from "next/link";

import { SettingsSection } from "@/components/account/settings-section";
import { accountRouteItems } from "@/lib/account/constants";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export default async function AccountOverviewPage() {
  const context = await requireAccountRequestContext();
  const snapshot = await getAccountSnapshot(context);

  return (
    <div className="grid gap-6">
      <SettingsSection
        description="A reusable enterprise account system for identity-safe profile data, notifications, devices, privacy requests, and operator preferences."
        eyebrow="Overview"
        title="Account control center"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              label: "Notification topics",
              value: snapshot.notifications.length.toString(),
            },
            {
              label: "Tracked sessions",
              value: snapshot.sessions.length.toString(),
            },
            {
              label: "Privacy requests",
              value: snapshot.privacyRequests.length.toString(),
            },
          ].map((item) => (
            <div
              className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5"
              key={item.label}
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] text-white/42 uppercase">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        description="Each module is capability-aware, so portfolio projects can enable or hide features without replacing the underlying account architecture."
        eyebrow="Modules"
        title="Jump into a settings module"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {accountRouteItems
            .filter((item) => item.href !== "/account")
            .map((item) => (
              <Link
                className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5 transition hover:border-white/16 hover:bg-white/[0.05]"
                href={item.href}
                key={item.href}
              >
                <p className="text-lg font-semibold text-white">{item.label}</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">{item.description}</p>
              </Link>
            ))}
        </div>
      </SettingsSection>
    </div>
  );
}

