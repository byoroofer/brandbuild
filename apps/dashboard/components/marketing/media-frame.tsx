import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

export type MediaFrameTone = "cyan" | "gold" | "violet" | "emerald";

const toneStyles: Record<
  MediaFrameTone,
  {
    glow: string;
    tint: string;
  }
> = {
  cyan: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(90,216,255,0.28),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(67,163,255,0.18),transparent_24%),linear-gradient(180deg,rgba(7,11,18,0.28),rgba(7,10,16,0.88))]",
    tint: "text-cyan-100",
  },
  emerald: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.26),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(34,197,94,0.16),transparent_22%),linear-gradient(180deg,rgba(7,11,18,0.24),rgba(7,10,16,0.88))]",
    tint: "text-emerald-100",
  },
  gold: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(255,214,102,0.3),transparent_30%),radial-gradient(circle_at_80%_14%,rgba(251,191,36,0.18),transparent_22%),linear-gradient(180deg,rgba(11,10,8,0.18),rgba(8,8,10,0.9))]",
    tint: "text-amber-100",
  },
  violet: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(148,92,255,0.34),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(96,165,250,0.16),transparent_24%),linear-gradient(180deg,rgba(7,10,18,0.18),rgba(7,10,16,0.9))]",
    tint: "text-violet-100",
  },
};

type MediaFrameProps = {
  badge: string;
  children?: ReactNode;
  className?: string;
  description: string;
  futureAssetPath?: string;
  label?: string;
  slotId: string;
  title: string;
  tone?: MediaFrameTone;
  videoSrc?: string;
};

export function MediaFrame({
  badge,
  children,
  className,
  description,
  futureAssetPath,
  label = "Loop ready",
  slotId,
  title,
  tone = "violet",
  videoSrc,
}: MediaFrameProps) {
  const toneStyle = toneStyles[tone];
  const assetPath = futureAssetPath ?? `/media/brandbuild/${slotId}.mp4`;

  return (
    <div
      className={cx(
        "group relative isolate overflow-hidden rounded-[30px] border border-white/10 bg-[#07090f]/88 shadow-[0_30px_90px_rgba(0,0,0,0.42)]",
        className,
      )}
    >
      <div className={cx("pointer-events-none absolute inset-0", toneStyle.glow)} />
      {videoSrc ? (
        <video
          autoPlay
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={videoSrc}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.12),transparent_30%,transparent_68%,rgba(255,255,255,0.08))] opacity-50 mix-blend-screen" />
      <div className="brandbuild-sheen pointer-events-none absolute inset-y-0 left-[-28%] w-[42%] bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.04),rgba(5,7,11,0.2)_42%,rgba(5,7,11,0.82)_92%)]" />

      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2">
        <span className="brandbuild-kicker">{badge}</span>
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-white/72 uppercase">
          {label}
        </span>
      </div>

      <div className="pointer-events-none absolute right-5 top-5 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-white/60 uppercase">
        Slot {slotId}
      </div>

      <div className="relative flex h-full min-h-[260px] flex-col justify-between p-5 pt-[4.5rem]">
        <div className="max-w-[17rem] space-y-3">
          <h3 className="text-[1.55rem] font-semibold tracking-[-0.04em] text-white">{title}</h3>
          <p className={cx("max-w-[15rem] text-sm leading-6 text-white/74", toneStyle.tint)}>
            {description}
          </p>
        </div>

        <div className="space-y-3">
          {children ? <div className="space-y-3">{children}</div> : null}
          <div className="h-px w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-white/70 via-white/35 to-transparent" />
          </div>
          <div className="flex items-center justify-between gap-4 text-[11px] leading-5 text-white/58">
            <span>Future media source</span>
            <span className="truncate text-right">{assetPath}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
