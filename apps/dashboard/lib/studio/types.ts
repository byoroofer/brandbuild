import type { Json } from "@/types/database";

export type CampaignStatus = "draft" | "active" | "in_review" | "approved" | "archived";
export type ShotStatus =
  | "planned"
  | "prompt_ready"
  | "queued"
  | "generating"
  | "generated"
  | "reviewed"
  | "selected"
  | "rejected"
  | "archived";
export type AssetType =
  | "reference_image"
  | "reference_video"
  | "generated_video"
  | "thumbnail"
  | "logo"
  | "product_image"
  | "character_sheet"
  | "moodboard"
  | "audio_track"
  | "subtitle_file"
  | "edit_export";
export type AssetSource = "upload" | "generated" | "external_link" | "manual";
export type ReviewDecision = "pending" | "selected" | "rejected" | "hold";
export type TargetModel = "sora" | "kling" | "higgsfield";
export type WorkspaceMode = "demo" | "live";
export type TagDiscoveryPlatform =
  | "instagram"
  | "tiktok"
  | "youtube-shorts"
  | "meta-ads"
  | "linkedin";
export type TagTrendSignal = "high" | "medium" | "emerging" | "relevance_only";
export type TagDiscoverySource = "openai-web-search" | "fallback";
export type TagDiscoveryInputMode = "text" | "audio" | "hybrid";

export type PromptStructure = {
  action: string;
  camera: string;
  constraints: string;
  dialogueAudioIntent: string;
  environment: string;
  lighting: string;
  mood: string;
  subject: string;
  visualStyle: string;
};

export type Campaign = {
  audience: string;
  brandName: string;
  callToAction: string;
  clientName: string;
  createdAt: string;
  createdBy?: string | null;
  defaultAspectRatios?: string[];
  dueDate?: string | null;
  hookAngle?: string;
  id: string;
  name: string;
  objective: string;
  offer: string;
  slug?: string | null;
  startDate?: string | null;
  status: CampaignStatus;
  targetPlatforms: string[];
};

export type Scene = {
  campaignId: string;
  createdAt: string;
  id: string;
  notes: string;
  objective: string;
  sceneNumber: number;
  title: string;
};

export type Shot = {
  aspectRatio: string;
  campaignId: string;
  createdAt: string;
  durationSeconds: number;
  id: string;
  negativePrompt?: string;
  notes: string;
  promptStructure: PromptStructure;
  promptText: string;
  purpose: string;
  sceneId?: string | null;
  sceneNumber: number;
  shotNumber: number;
  status: ShotStatus;
  targetModel: TargetModel;
  title: string;
};

export type ShotGeneration = {
  aspectRatio?: string | null;
  createdAt: string;
  durationSeconds?: number | null;
  generationNotes: string;
  id: string;
  integrationMode: "live" | "mock";
  outputUrl?: string | null;
  progress?: number | null;
  provider: TargetModel;
  providerJobId?: string | null;
  providerMessage?: string | null;
  providerStatus?: string | null;
  requestPayload: Record<string, Json | undefined>;
  responsePayload: Record<string, Json | undefined>;
  seed?: string | null;
  shotId: string;
  status: string;
  thumbnailUrl?: string | null;
};

export type PromptTemplate = {
  actionTemplate?: string | null;
  cameraTemplate?: string | null;
  category: string;
  constraintsTemplate?: string | null;
  createdAt: string;
  description: string;
  dialogueAudioTemplate?: string | null;
  environmentTemplate?: string | null;
  finalTemplate: string;
  id: string;
  isSystem: boolean;
  lightingTemplate?: string | null;
  moodTemplate?: string | null;
  name: string;
  subjectTemplate?: string | null;
  targetModel?: TargetModel | null;
  visualStyleTemplate?: string | null;
};

export type Asset = {
  campaignId: string;
  createdAt: string;
  durationSeconds?: number | null;
  fileName: string;
  fileSizeBytes?: number | null;
  fileUrl: string;
  generationId?: string | null;
  height?: number | null;
  id: string;
  metadataJson: Record<string, string | number | boolean | null>;
  mimeType?: string | null;
  shotId: string | null;
  source?: AssetSource;
  tags?: string[];
  type: AssetType;
  width?: number | null;
};

export type Review = {
  assetId: string;
  createdAt: string;
  decision: ReviewDecision;
  id: string;
  notes: string;
  reviewerName: string;
  scoreBrandFit: number;
  scoreEditability: number;
  scoreHookStrength: number;
  scoreMotionQuality: number;
  scorePromptFidelity: number;
  scoreRealism: number;
  selectedBoolean: boolean;
  shotId: string;
};

export type VersionCandidate = {
  asset: Asset;
  averageScore: number | null;
  campaign: Campaign | null;
  createdAt: string;
  generation: ShotGeneration | null;
  id: string;
  provider: TargetModel | null;
  review: Review | null;
  shot: Shot | null;
  thumbnailAsset: Asset | null;
};

export type VersionGroup = {
  averageScore: string;
  campaign: Campaign | null;
  candidateCount: number;
  latestCreatedAt: string;
  pendingReviewCount: number;
  readyForHandoff: boolean;
  selectedCandidateId: string | null;
  selectedCount: number;
  shot: Shot | null;
  versionCandidates: VersionCandidate[];
};

export type HandoffPackage = {
  campaign: Campaign;
  deliverableChecklist: string[];
  editorNotes: string[];
  exportReady: boolean;
  id: string;
  missingShotCount: number;
  missingShots: Shot[];
  pendingReviewCount: number;
  selectedVersions: VersionCandidate[];
};

export type StudioStat = {
  helper: string;
  label: string;
  value: string;
};

export type RoutingRecommendation = {
  fitSummary: string;
  model: TargetModel;
  rationale: string;
};

export type TagDiscoveryTag = {
  label: string;
  platforms: TagDiscoveryPlatform[];
  rationale: string;
  trendSignal: TagTrendSignal;
};

export type TagDiscoveryCitation = {
  title: string;
  url: string;
};

export type TagDiscoveryResult = {
  citations: TagDiscoveryCitation[];
  freshnessLabel: string;
  generatedAt: string;
  inputMode: TagDiscoveryInputMode;
  model: string;
  platforms: TagDiscoveryPlatform[];
  query: string;
  source: TagDiscoverySource;
  summary: string;
  tags: TagDiscoveryTag[];
  transcript?: string | null;
};

export type DashboardHomeData = {
  mode: WorkspaceMode;
  recentCampaigns: Campaign[];
  recentShots: Array<Shot & { campaignName: string }>;
  stats: StudioStat[];
};

export type CampaignDetail = {
  assets: Asset[];
  campaign: Campaign;
  mode: WorkspaceMode;
  reviews: Review[];
  shots: Shot[];
};

export type ShotDetail = {
  assets: Asset[];
  campaign: Campaign;
  generations: ShotGeneration[];
  mode: WorkspaceMode;
  promptTemplates: PromptTemplate[];
  reviews: Review[];
  routingRecommendation: RoutingRecommendation;
  shot: Shot;
};

export type ReviewComparisonCandidate = Review & {
  asset: Asset | null;
  averageScore: number;
  campaign: Campaign | null;
  campaignName: string;
  generation: ShotGeneration | null;
  provider: TargetModel | null;
  shot: Shot | null;
};

export type ReviewComparisonGroup = {
  averageScore: string;
  campaign: Campaign | null;
  candidateCount: number;
  comparisonCandidates: ReviewComparisonCandidate[];
  latestReviewAt: string;
  selectedCount: number;
  shot: Shot | null;
  topCandidateId: string | null;
};

export type ReviewsSummary = {
  averageBrandFit: string;
  averageEditability: string;
  averageHookStrength: string;
  averageRealism: string;
  compareGroups: ReviewComparisonGroup[];
  decisionCounts: Record<ReviewDecision, number>;
  mode: WorkspaceMode;
  providerCounts: Record<TargetModel, number>;
  rejectedCount: number;
  reviews: ReviewComparisonCandidate[];
  selectedCount: number;
};

export type AssetsWorkspace = {
  assets: Asset[];
  campaigns: Campaign[];
  handoffPackages: HandoffPackage[];
  mode: WorkspaceMode;
  shots: Shot[];
  versionGroups: VersionGroup[];
};
