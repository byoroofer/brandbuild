import type { ReactNode } from "react";

type AccountEmptyStateProps = {
  action?: ReactNode;
  description: string;
  title: string;
};

export function AccountEmptyState({
  action,
  description,
  title,
}: AccountEmptyStateProps) {
  return (
    <div className="rounded-[26px] border border-dashed border-white/12 bg-white/[0.025] p-6 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

