import type { Json } from "@/types/database";

import type { TargetModel } from "@/lib/studio/types";

export type ProviderName = TargetModel;

export type ProviderCapability =
  | "premium-cinematic"
  | "controlled-motion"
  | "character-performance"
  | "hero-polish"
  | "experimental-worldbuilding"
  | "lip-sync-friendly";

export type GenerationRequest = {
  aspectRatio: string;
  campaignId: string;
  durationSeconds: number;
  promptText: string;
  referenceAssetUrls: string[];
  shotId: string;
};

export type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed" | "mocked";
export type GenerationIntegrationMode = "live" | "mock";
export type GenerationJobRaw = { [key: string]: Json | undefined };

export type GenerationJob = {
  id: string;
  integrationMode: GenerationIntegrationMode;
  outputUrl?: string | null;
  provider: TargetModel;
  raw?: GenerationJobRaw;
  status: GenerationJobStatus;
  thumbnailUrl?: string | null;
};

export type ProviderCatalogItem = {
  capabilities: ProviderCapability[];
  configured: boolean;
  description: string;
  fitSummary: string;
  id: TargetModel;
  integrationStage: "live" | "stubbed";
  label: string;
};

export interface GenerationProviderAdapter {
  capabilities: ProviderCapability[];
  description: string;
  id: TargetModel;
  label: string;
  enqueue(request: GenerationRequest): Promise<GenerationJob>;
  getContent?(jobId: string): Promise<Response>;
  getJob(jobId: string): Promise<GenerationJob>;
  isConfigured(): boolean;
}

export type VideoProvider = GenerationProviderAdapter;
