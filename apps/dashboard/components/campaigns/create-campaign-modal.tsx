"use client";

import { useActionState, useEffect, useState } from "react";

import {
  createCampaignAction,
  initialStudioActionState,
} from "@/app/actions/studio";
import { Button } from "@/components/ui/button";

type CreateCampaignModalProps = {
  openOnLoad?: boolean;
  persistenceEnabled: boolean;
};

const platformOptions = [
  "YouTube",
  "Meta",
  "Landing Page",
  "TikTok",
  "Instagram Reels",
  "LinkedIn",
  "Sales Enablement",
];

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40";

export function CreateCampaignModal({
  openOnLoad = false,
  persistenceEnabled,
}: CreateCampaignModalProps) {
  const [isOpen, setIsOpen] = useState(openOnLoad);
  const [state, formAction, isPending] = useActionState(
    createCampaignAction,
    initialStudioActionState,
  );

  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <Button disabled={!persistenceEnabled} onClick={() => setIsOpen(true)} size="md" type="button">
        Create campaign
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-10 backdrop-blur-sm">
          <div className="app-shell w-full max-w-3xl rounded-[32px] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  New campaign
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Create a production campaign</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Capture the client, offer, objective, and target platforms so scenes and shots start from a proper production brief.
                </p>
              </div>

              <button
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <form action={formAction} className="mt-8 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input className={inputClassName} name="name" placeholder="Campaign name" required />
                <input className={inputClassName} name="clientName" placeholder="Client name" required />
                <input className={inputClassName} name="brandName" placeholder="Brand name" required />
                <input className={inputClassName} name="offer" placeholder="Offer" required />
              </div>

              <textarea className={inputClassName} name="objective" placeholder="Objective" required rows={3} />
              <textarea className={inputClassName} name="audience" placeholder="Audience" required rows={3} />
              <textarea className={inputClassName} name="callToAction" placeholder="Call to action" required rows={2} />

              <div className="rounded-[28px] border border-white/8 bg-black/14 p-4">
                <p className="text-sm font-semibold text-white">Target platforms</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {platformOptions.map((platform) => (
                    <label
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-2 text-sm text-slate-300"
                      key={platform}
                    >
                      <input className="accent-cyan-400" name="targetPlatforms" type="checkbox" value={platform} />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              {!persistenceEnabled ? (
                <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  Supabase admin access is not configured here yet, so campaign creation is disabled.
                </p>
              ) : null}

              {state.error ? (
                <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {state.error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3">
                <Button onClick={() => setIsOpen(false)} type="button" variant="ghost">
                  Cancel
                </Button>
                <Button disabled={!persistenceEnabled || isPending} type="submit">
                  {isPending ? "Creating..." : "Create campaign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
