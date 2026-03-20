import "server-only";

import { getProviderCatalogItem } from "@/lib/studio/providers/config";
import type {
  GenerationJob,
  GenerationProviderAdapter,
  GenerationRequest,
} from "@/lib/studio/providers/types";

function buildMockedJob(jobId: string): GenerationJob {
  return {
    id: jobId,
    integrationMode: "mock",
    outputUrl: null,
    provider: "higgsfield",
    raw: {
      message: "Higgsfield integration stub ready for real API wiring.",
    },
    status: "mocked",
    thumbnailUrl: null,
  };
}

export const higgsfieldProvider: GenerationProviderAdapter = {
  capabilities: ["experimental-worldbuilding", "premium-cinematic"],
  description: getProviderCatalogItem("higgsfield").description,
  id: "higgsfield",
  label: "Higgsfield",
  async enqueue(request: GenerationRequest) {
    return buildMockedJob(`mock-higgsfield-${request.shotId}`);
  },
  async getJob(jobId: string) {
    return buildMockedJob(jobId);
  },
  isConfigured() {
    return getProviderCatalogItem("higgsfield").configured;
  },
};
