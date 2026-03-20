import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { getWorkspaceMode } from "@/lib/studio/repository";

type DashboardLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  await requireUser();
  const mode = await getWorkspaceMode();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <DashboardShell mode={mode}>{children}</DashboardShell>
    </div>
  );
}
