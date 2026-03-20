"use client";

import { useActionState } from "react";

import { selectRoleAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { initialActionState } from "@/lib/forms/action-state";

const roleOptions = [
  {
    value: "creator",
    title: "I'm a creator",
    description:
      "Build a campaign-ready profile, receive polished briefs, and manage partnerships in one place.",
  },
  {
    value: "campaign",
    title: "I'm with a campaign",
    description:
      "Set up your creator program, align briefs, and move fast without a patchwork of spreadsheets and DMs.",
  },
];

export function RoleSelectionForm() {
  const [state, formAction, isPending] = useActionState(selectRoleAction, initialActionState);

  return (
    <SurfaceCard className="p-8 sm:p-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
            Choose your role
          </span>
          <div className="space-y-2">
            <h1 className="display-font text-4xl leading-none text-slate-950">
              Which side of PolitiViral are you joining?
            </h1>
            <p className="text-base leading-7 text-slate-600">
              Pick the experience that matches your workflow. You can continue onboarding right away.
            </p>
          </div>
        </div>

        <form action={formAction} className="grid gap-4">
          {roleOptions.map((option) => (
            <button
              className="group rounded-[26px] border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)]"
              disabled={isPending}
              key={option.value}
              name="role"
              type="submit"
              value={option.value}
            >
              <div className="space-y-3">
                <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white uppercase">
                  {option.value}
                </span>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-950">{option.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{option.description}</p>
                </div>
              </div>
            </button>
          ))}

          {state.error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </p>
          ) : null}

          <Button className="w-full sm:w-auto" disabled={isPending} size="lg" type="submit" variant="ghost">
            {isPending ? "Saving role..." : "Select a role above to continue"}
          </Button>
        </form>
      </div>
    </SurfaceCard>
  );
}
