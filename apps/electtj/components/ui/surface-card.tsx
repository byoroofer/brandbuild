import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light" | "outline";
};

function cx(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const toneStyles = {
  dark:
    "border border-[var(--border)] bg-[linear-gradient(180deg,rgba(15,24,46,0.88),rgba(9,15,28,0.82))] text-white shadow-premium backdrop-blur-xl hover:border-[rgba(243,213,160,0.22)]",
  light:
    "border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,243,235,0.94))] text-[var(--text-dark)] shadow-[0_24px_72px_rgba(15,23,42,0.08)] hover:border-slate-300",
  outline:
    "border border-[rgba(243,213,160,0.18)] bg-white/3 text-white backdrop-blur-md hover:border-[rgba(243,213,160,0.3)] hover:bg-white/4",
};

export function SurfaceCard({ children, className, tone = "dark" }: SurfaceCardProps) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[2rem] transition duration-300 ease-out hover:-translate-y-0.5",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
