"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { SurfaceCard } from "@/components/ui/surface-card";

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="page-shell py-10">
      <SurfaceCard className="mx-auto max-w-3xl px-8 py-12 text-center sm:px-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--gold-soft)] uppercase">
          Something broke
        </p>
        <h1 className="display-font mt-4 text-5xl leading-none text-white sm:text-6xl">
          The page hit a rough patch.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--text-muted)]">
          Try reloading this route or jump back to the campaign home page. The updated interface is
          designed to recover gracefully without leaving visitors stranded.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
          {error.message}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-full border border-[rgba(201,155,82,0.45)] bg-[linear-gradient(135deg,#f3d5a0,#c99b52)] px-6 py-3.5 text-base font-semibold text-slate-950 transition duration-200 hover:-translate-y-0.5"
            onClick={() => reset()}
            type="button"
          >
            Try again
          </button>
          <ButtonLink href="/" variant="secondary">
            Go home
          </ButtonLink>
        </div>
      </SurfaceCard>
    </div>
  );
}
