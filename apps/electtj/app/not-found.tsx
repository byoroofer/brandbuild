import { ButtonLink } from "@/components/ui/button-link";
import { SurfaceCard } from "@/components/ui/surface-card";

export default function NotFound() {
  return (
    <div className="page-shell py-10">
      <SurfaceCard className="mx-auto max-w-3xl px-8 py-12 text-center sm:px-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
          404
        </p>
        <h1 className="display-font mt-4 text-5xl leading-none text-white sm:text-6xl">
          That page is not part of the campaign path.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--text-muted)]">
          Use the redesigned navigation to get back to the pages that matter most for voters,
          volunteers, supporters, and press.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/donate" variant="secondary">
            Donate
          </ButtonLink>
        </div>
      </SurfaceCard>
    </div>
  );
}
