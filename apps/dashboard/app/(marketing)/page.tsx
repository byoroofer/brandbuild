import { redirect } from "next/navigation";

import { BrandbuildHomepage } from "@/components/marketing/brandbuild-homepage";
import { getOptionalUser } from "@/lib/auth/session";
import { listProviderCatalog } from "@/lib/studio/providers";
import { getWorkspaceMode } from "@/lib/studio/repository";
import type { WorkspaceMode } from "@/lib/studio/types";

export default async function HomePage() {
  let user = null;
  try {
    user = await getOptionalUser();
  } catch {
    // Auth check failed — continue as unauthenticated
  }

  if (user) {
    redirect("/dashboard");
  }

  let mode: WorkspaceMode = "demo";
  let providers = listProviderCatalog();

  try {
    const results = await Promise.all([
      getWorkspaceMode(),
      Promise.resolve(listProviderCatalog()),
    ]);
    mode = results[0];
    providers = results[1];
  } catch {
    // Data fetch failed — render in demo mode with defaults
  }

  return <BrandbuildHomepage mode={mode} providers={providers} />;
}
