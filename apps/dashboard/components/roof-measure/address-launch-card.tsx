"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Panel } from "@/components/studio/panel";
import { Button } from "@/components/ui/button";

interface AddressLaunchCardProps {
  title: string;
  description: string;
  ctaLabel?: string;
  initialAddress?: string;
}

export function AddressLaunchCard({
  title,
  description,
  ctaLabel = "Open roof measure",
  initialAddress = "",
}: AddressLaunchCardProps) {
  const router = useRouter();
  const [address, setAddress] = useState(initialAddress);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      return;
    }

    router.push(`/roof-measure/measure?address=${encodeURIComponent(trimmedAddress)}`);
  }

  return (
    <Panel className="p-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-100 uppercase">
          Roof Measure
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
        </div>
      </div>

      <form className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
        <input
          aria-label="Property address"
          className="w-full rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Enter the property address for the roof report"
          value={address}
        />
        <Button size="lg" type="submit">
          {ctaLabel}
        </Button>
      </form>

      <p className="mt-4 text-xs leading-6 text-slate-500">
        Customer confirms the correct structure with a drop pin on the map before tracing
        the roof outline.
      </p>
    </Panel>
  );
}
