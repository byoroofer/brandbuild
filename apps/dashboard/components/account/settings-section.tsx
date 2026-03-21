import type { ReactNode } from "react";

type SettingsSectionProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function SettingsSection({
  actions,
  children,
  description,
  eyebrow,
  title,
}: SettingsSectionProps) {
  return (
    <section className="app-shell rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-[11px] font-semibold tracking-[0.22em] text-white/40 uppercase">
              {eyebrow}
            </p>
          ) : null}
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">{title}</h2>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">{description}</p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}

