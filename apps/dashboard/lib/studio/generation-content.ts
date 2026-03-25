import type { GenerationIntegrationMode } from "@/lib/studio/providers/types";
import type { TargetModel } from "@/lib/studio/types";

type ResolveGenerationOutputInput = {
  generationId: string;
  integrationMode: GenerationIntegrationMode;
  outputUrl?: string | null;
  provider: TargetModel;
  providerJobId?: string | null;
  status?: string | null;
};

export function buildGenerationContentPath(generationId: string) {
  return `/api/generate/${generationId}/content`;
}

export function shouldProxyGenerationContent(input: {
  integrationMode: GenerationIntegrationMode;
  provider: TargetModel;
  providerJobId?: string | null;
  status?: string | null;
}) {
  return (
    input.integrationMode === "live" &&
    input.provider === "sora" &&
    Boolean(input.providerJobId) &&
    input.status === "succeeded"
  );
}

export function resolveGenerationOutputPath(input: ResolveGenerationOutputInput) {
  if (shouldProxyGenerationContent(input)) {
    return buildGenerationContentPath(input.generationId);
  }

  return input.outputUrl ?? null;
}
