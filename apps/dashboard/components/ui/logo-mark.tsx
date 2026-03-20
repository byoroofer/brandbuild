import { cx } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <span
      className={cx(
        "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-sm font-semibold tracking-[0.18em] text-white shadow-[0_18px_40px_rgba(139,92,246,0.3)]",
        className,
      )}
    >
      AV
    </span>
  );
}
