import type { ComponentPropsWithoutRef } from "react";

import { cx } from "@/lib/utils";

type PanelProps = ComponentPropsWithoutRef<"div">;

export function Panel({ className, ...props }: PanelProps) {
  return (
    <div
      className={cx("app-shell relative rounded-[30px]", className)}
      {...props}
    />
  );
}
