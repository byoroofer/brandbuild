import { ButtonLink } from "@/components/ui/button-link";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { ActionPath } from "@/lib/site-content";

type ActionGridProps = {
  cardTone?: "dark" | "light" | "outline";
  gridClassName?: string;
  items: ActionPath[];
};

function cx(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ActionGrid({
  cardTone = "light",
  gridClassName = "md:grid-cols-2 xl:grid-cols-3",
  items,
}: ActionGridProps) {
  const isLight = cardTone === "light";

  return (
    <div className={cx("grid gap-6", gridClassName)}>
      {items.map((item) => (
        <SurfaceCard className="h-full p-7" key={`${item.eyebrow}-${item.title}`} tone={cardTone}>
          <div className="flex h-full flex-col gap-5">
            <div className="space-y-4">
              <p
                className={cx(
                  "text-xs font-semibold tracking-[0.18em] uppercase",
                  isLight ? "text-[var(--text-dark-muted)]" : "text-[var(--gold-soft)]",
                )}
              >
                {item.eyebrow}
              </p>
              <div className="space-y-3">
                <h3
                  className={cx(
                    "text-2xl font-semibold leading-tight",
                    isLight ? "text-[var(--text-dark)]" : "text-white",
                  )}
                >
                  {item.title}
                </h3>
                <p
                  className={cx(
                    "text-sm leading-7",
                    isLight ? "text-[var(--text-dark-muted)]" : "text-[var(--text-muted)]",
                  )}
                >
                  {item.description}
                </p>
              </div>
            </div>
            <div className="mt-auto pt-2">
              <ButtonLink href={item.href} variant={isLight ? "light" : "secondary"}>
                {item.ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}
