import { redirect } from "next/navigation";

import { BrandbuildHomepage } from "@/components/marketing/brandbuild-homepage";
import { getOptionalUser } from "@/lib/auth/session";
import { listProviderCatalog } from "@/lib/studio/providers";
import { getWorkspaceMode } from "@/lib/studio/repository";

export default async function HomePage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  const [mode, providers] = await Promise.all([
    getWorkspaceMode(),
    Promise.resolve(listProviderCatalog()),
  ]);

  return <BrandbuildHomepage mode={mode} providers={providers} />;
}
