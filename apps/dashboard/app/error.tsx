"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error for production monitoring
    console.error("[BrandBuild] Application error:", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/4 p-10 text-center backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          BrandBuild
        </p>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-7 text-white/56">
          An unexpected error occurred. Our team has been notified.
          {error.digest ? (
            <span className="mt-2 block text-xs text-white/30">Ref: {error.digest}</span>
          ) : null}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            className="brandbuild-primary-button h-10 px-5 text-sm"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <a
            className="brandbuild-secondary-button h-10 px-5 text-sm"
            href="/"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
