import { SurfaceCard } from "@/components/ui/surface-card";
import type { StatItem } from "@/lib/site-content";

type StatBandProps = {
  items: StatItem[];
  tone?: "dark" | "light";
};

export function StatBand({ items, tone = "light" }: StatBandProps) {
  const isLight = tone === "light";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <SurfaceCard className="p-7" key={`${item.value}-${item.label}`} tone={tone}>
          <div className="space-y-4">
            <div className="space-y-2">
              <p
                className={`display-font text-4xl leading-none ${isLight ? "text-[var(--text-dark)]" : "text-white"}`}
              >
                {item.value}
              </p>
              <p
                className={`text-sm font-semibold leading-6 ${isLight ? "text-[var(--text-dark)]" : "text-white"}`}
              >
                {item.label}
              </p>
            </div>
            <p
              className={`text-sm leading-7 ${isLight ? "text-[var(--text-dark-muted)]" : "text-[var(--text-muted)]"}`}
            >
              {item.detail}
            </p>
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}
