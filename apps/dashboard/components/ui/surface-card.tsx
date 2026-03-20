import type { ComponentPropsWithoutRef } from "react";

import { cx } from "@/lib/utils";

type SurfaceCardProps = ComponentPropsWithoutRef<"div">;

export function SurfaceCard({ className, ...props }: SurfaceCardProps) {
  return (
    <div
      className={cx(
        "relative rounded-[28px] border border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
