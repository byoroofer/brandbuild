"use client";

import { usePathname } from "next/navigation";

import { ButtonLink } from "@/components/ui/button-link";
import { actionLinks } from "@/lib/site-content";

export function MobileActionBar() {
  const pathname = usePathname();
  const secondaryAction =
    pathname === "/volunteer"
      ? { href: actionLinks.survey, label: "Survey" }
      : pathname === "/donate"
        ? { href: "/volunteer", label: "Join" }
        : { href: "/volunteer", label: "Join" };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-[1.6rem] border border-white/10 bg-[rgba(8,13,26,0.92)] p-3 shadow-[0_24px_60px_rgba(4,8,18,0.48)] backdrop-blur-2xl">
        <ButtonLink className="flex-1" href={secondaryAction.href} variant="secondary">
          {secondaryAction.label}
        </ButtonLink>
        <ButtonLink className="flex-1" href="/donate">
          Donate
        </ButtonLink>
      </div>
    </div>
  );
}
