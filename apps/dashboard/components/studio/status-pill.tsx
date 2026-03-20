import { cx } from "@/lib/utils";

type StatusPillProps = {
  label?: string;
  status?: string;
  tone?: "default" | "info" | "success" | "warning" | "danger";
};

const toneMap: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-100",
  default: "border-white/10 bg-white/6 text-slate-200",
  info: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-100",
};

const statusToneMap: Record<string, NonNullable<StatusPillProps["tone"]>> = {
  active: "info",
  approved: "success",
  archived: "default",
  draft: "default",
  generated: "info",
  generating: "info",
  hold: "warning",
  in_review: "info",
  live: "success",
  mocked: "warning",
  pending: "warning",
  planned: "default",
  prompt_ready: "warning",
  queued: "warning",
  rejected: "danger",
  reviewed: "info",
  selected: "success",
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export function StatusPill({ label, status, tone = "default" }: StatusPillProps) {
  const normalizedStatus = status?.toLowerCase();
  const resolvedTone = normalizedStatus ? statusToneMap[normalizedStatus] ?? tone : tone;
  const content = label ?? (normalizedStatus ? humanize(normalizedStatus) : tone);

  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase",
        toneMap[resolvedTone],
      )}
    >
      {content}
    </span>
  );
}
