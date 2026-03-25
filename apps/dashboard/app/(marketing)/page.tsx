import { BrandbuildHomepage } from "@/components/marketing/brandbuild-homepage";
import { isStudioPersistenceEnabled } from "@/lib/studio/repository";
import { listProviderCatalog } from "@/lib/studio/providers";
import type { WorkspaceMode } from "@/lib/studio/types";

export default function HomePage() {
  const providers = listProviderCatalog();
  const mode: WorkspaceMode = isStudioPersistenceEnabled() ? "live" : "demo";

  return <BrandbuildHomepage mode={mode} providers={providers} />;
}
