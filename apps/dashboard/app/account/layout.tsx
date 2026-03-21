import type { ReactNode } from "react";

import { AccountShell } from "@/components/account/account-shell";
import { getAccountSnapshot } from "@/lib/account/repository";
import { requireAccountRequestContextOrRedirect } from "@/lib/account/server";

type AccountLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const context = await requireAccountRequestContextOrRedirect("/account");
  const snapshot = await getAccountSnapshot(context);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <AccountShell capabilities={snapshot.capabilities} user={snapshot.user}>
        {children}
      </AccountShell>
    </div>
  );
}
