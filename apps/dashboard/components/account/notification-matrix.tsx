"use client";

import type {
  AccountCapabilities,
  AccountNotificationPreference,
} from "@/lib/account/types";

type NotificationMatrixProps = {
  capabilities: AccountCapabilities;
  onChange: (next: AccountNotificationPreference[]) => void;
  value: AccountNotificationPreference[];
};

function updateTopic(
  value: AccountNotificationPreference[],
  topic: AccountNotificationPreference["topic"],
  patch: Partial<AccountNotificationPreference>,
) {
  return value.map((item) => (item.topic === topic ? { ...item, ...patch } : item));
}

export function NotificationMatrix({
  capabilities,
  onChange,
  value,
}: NotificationMatrixProps) {
  return (
    <div className="grid gap-4">
      {value.map((item) => (
        <div
          className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4"
          key={item.topic}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-white">{item.label}</p>
                {item.transactional ? (
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-emerald-100 uppercase">
                    Transactional
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { key: "inAppEnabled", label: "In-app", visible: true },
                { key: "emailEnabled", label: "Email", visible: true },
                { key: "smsEnabled", label: "SMS", visible: capabilities.hasSmsNotifications },
                { key: "pushEnabled", label: "Push", visible: capabilities.hasPushNotifications },
              ]
                .filter((channel) => channel.visible)
                .map((channel) => {
                  const checked = item[channel.key as keyof AccountNotificationPreference] as boolean;
                  const locked = item.topic === "security" && (channel.key === "inAppEnabled" || channel.key === "emailEnabled");

                  return (
                    <label
                      className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/20 px-3 py-3 text-sm text-slate-200"
                      key={`${item.topic}-${channel.key}`}
                    >
                      <span>{channel.label}</span>
                      <input
                        checked={checked}
                        className="h-4 w-4 accent-amber-300"
                        disabled={locked}
                        onChange={(event) =>
                          onChange(
                            updateTopic(value, item.topic, {
                              [channel.key]: event.target.checked,
                            }),
                          )
                        }
                        type="checkbox"
                      />
                    </label>
                  );
                })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,220px)_minmax(0,180px)_minmax(0,180px)_minmax(0,220px)]">
            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Frequency
              </span>
              <select
                className="rounded-[18px] border border-white/8 bg-black/20 px-3 py-3 text-sm text-white"
                disabled={item.topic === "security"}
                onChange={(event) =>
                  onChange(
                    updateTopic(value, item.topic, {
                      frequency: event.target.value as AccountNotificationPreference["frequency"],
                    }),
                  )
                }
                value={item.frequency}
              >
                <option value="instant">Instant</option>
                <option value="daily_digest">Daily digest</option>
                <option value="weekly_digest">Weekly digest</option>
                <option value="off">Off</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Quiet hours start
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-3 py-3 text-sm text-white"
                onChange={(event) =>
                  onChange(
                    updateTopic(value, item.topic, {
                      quietHoursStart: event.target.value || null,
                    }),
                  )
                }
                type="time"
                value={item.quietHoursStart ?? ""}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Quiet hours end
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-3 py-3 text-sm text-white"
                onChange={(event) =>
                  onChange(
                    updateTopic(value, item.topic, {
                      quietHoursEnd: event.target.value || null,
                    }),
                  )
                }
                type="time"
                value={item.quietHoursEnd ?? ""}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
                Delivery timezone
              </span>
              <input
                className="rounded-[18px] border border-white/8 bg-black/20 px-3 py-3 text-sm text-white"
                onChange={(event) =>
                  onChange(
                    updateTopic(value, item.topic, {
                      timezone: event.target.value,
                    }),
                  )
                }
                placeholder="America/Chicago"
                value={item.timezone}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

