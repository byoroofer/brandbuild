import { listProviderCatalog } from "@/lib/studio/providers/config";
import { higgsfieldProvider } from "@/lib/studio/providers/higgsfield";
import { klingProvider } from "@/lib/studio/providers/kling";
import { soraProvider } from "@/lib/studio/providers/sora";
import type { ProviderName, VideoProvider } from "@/lib/studio/providers/types";

const providers: Record<ProviderName, VideoProvider> = {
  higgsfield: higgsfieldProvider,
  kling: klingProvider,
  sora: soraProvider,
};

export function getProvider(name: ProviderName): VideoProvider {
  return providers[name];
}

export function getProviderAdapter(model: ProviderName) {
  return getProvider(model);
}

export { listProviderCatalog };
