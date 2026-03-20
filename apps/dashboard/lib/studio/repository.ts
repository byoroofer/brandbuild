import { createStudioReadClient, hasStudioPersistenceEnv } from "@/lib/db/client";
import { createAdminSupabaseClient, isSupabaseAdminAvailable } from "@/lib/supabase/admin";
import {
  demoAssets,
  demoCampaigns,
  demoPromptTemplates,
  demoReviews,
  demoShotGenerations,
  demoShots,
} from "@/lib/studio/demo-data";
import { getRoutingRecommendation } from "@/lib/studio/model-routing";
import type {
  Asset,
  Campaign,
  CampaignDetail,
  DashboardHomeData,
  PromptTemplate,
  Review,
  ReviewsSummary,
  Shot,
  ShotDetail,
  ShotGeneration,
  TargetModel,
  WorkspaceMode,
} from "@/lib/studio/types";
import type { Database, Json } from "@/types/database";
import { parseStoragePointer } from "@/lib/utils/storage";

type CampaignRow = Database["public"]["Tables"]["campaigns"]["Row"];
type ShotRow = Database["public"]["Tables"]["shots"]["Row"];
type AssetRow = Database["public"]["Tables"]["assets"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type PromptTemplateRow = Database["public"]["Tables"]["prompt_templates"]["Row"];
type ShotGenerationRow = Database["public"]["Tables"]["shot_generations"]["Row"];

type WorkspaceData = {
  assets: Asset[];
  campaigns: Campaign[];
  generations: ShotGeneration[];
  mode: WorkspaceMode;
  promptTemplates: PromptTemplate[];
  reviews: Review[];
  shots: Shot[];
};

function parsePromptText(promptText: string | null | undefined) {
  const text = promptText ?? "";
  const lines = text.split("\n");

  const getValue = (label: string) =>
    lines
      .find((line) => line.toLowerCase().startsWith(`${label.toLowerCase()}:`))
      ?.slice(label.length + 1)
      .trim() ?? "";

  return {
    action: getValue("Action"),
    camera: getValue("Camera"),
    constraints: getValue("Constraints"),
    dialogueAudioIntent: getValue("Dialogue / audio intent"),
    environment: getValue("Environment"),
    lighting: getValue("Lighting"),
    mood: getValue("Mood"),
    subject: getValue("Subject"),
    visualStyle: getValue("Visual style"),
  };
}

function asMetadataRecord(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, string | number | boolean | null>;
}

function asJsonObject(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

async function resolveStorageBackedAssetRows(assetRows: AssetRow[]) {
  if (!isSupabaseAdminAvailable()) {
    return assetRows;
  }

  const admin = createAdminSupabaseClient();

  return Promise.all(
    assetRows.map(async (assetRow) => {
      const storagePointer = parseStoragePointer(assetRow.file_url);

      if (!storagePointer) {
        return assetRow;
      }

      const { data, error } = await admin.storage
        .from(storagePointer.bucket)
        .createSignedUrl(storagePointer.objectPath, 60 * 60);

      if (!error && data?.signedUrl) {
        return {
          ...assetRow,
          file_url: data.signedUrl,
        };
      }

      const metadata = asMetadataRecord(assetRow.metadata_json);

      return {
        ...assetRow,
        file_url:
          typeof metadata.provider_source_url === "string"
            ? metadata.provider_source_url
            : assetRow.file_url,
      };
    }),
  );
}

function mapCampaignRow(row: CampaignRow): Campaign {
  return {
    audience: row.audience ?? "",
    brandName: row.brand_name ?? "",
    callToAction: row.call_to_action ?? "",
    clientName: row.client_name ?? "",
    createdAt: row.created_at,
    createdBy: row.created_by,
    defaultAspectRatios: row.default_aspect_ratios ?? [],
    dueDate: row.due_date,
    hookAngle: row.hook_angle ?? "",
    id: row.id,
    name: row.name,
    objective: row.objective ?? "",
    offer: row.offer ?? "",
    slug: row.slug,
    startDate: row.start_date,
    status: row.status,
    targetPlatforms: row.target_platforms ?? [],
  };
}

function mapShotRow(row: ShotRow): Shot {
  const parsedPrompt = parsePromptText(row.prompt_text);

  return {
    aspectRatio: row.aspect_ratio ?? "9:16",
    campaignId: row.campaign_id,
    createdAt: row.created_at,
    durationSeconds: row.duration_seconds ?? 8,
    id: row.id,
    negativePrompt: row.negative_prompt ?? "",
    notes: row.internal_notes ?? "",
    promptStructure: {
      action: parsedPrompt.action,
      camera: row.camera_direction ?? parsedPrompt.camera,
      constraints: row.constraints ?? parsedPrompt.constraints,
      dialogueAudioIntent: row.dialogue_audio_intent ?? parsedPrompt.dialogueAudioIntent,
      environment: row.environment ?? parsedPrompt.environment,
      lighting: row.lighting ?? parsedPrompt.lighting,
      mood: row.mood ?? parsedPrompt.mood,
      subject: parsedPrompt.subject,
      visualStyle: row.visual_style ?? parsedPrompt.visualStyle,
    },
    promptText: row.prompt_text ?? "",
    purpose: row.purpose ?? "",
    sceneId: row.scene_id,
    sceneNumber: row.scene_number,
    shotNumber: row.shot_number,
    status: row.status,
    targetModel: row.target_model,
    title: row.title,
  };
}

function mapAssetRow(row: AssetRow): Asset {
  return {
    campaignId: row.campaign_id,
    createdAt: row.created_at,
    durationSeconds: row.duration_seconds ? Number(row.duration_seconds) : null,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    fileUrl: row.file_url,
    generationId: row.generation_id,
    height: row.height,
    id: row.id,
    metadataJson: asMetadataRecord(row.metadata_json),
    mimeType: row.mime_type,
    shotId: row.shot_id,
    source: row.source,
    tags: row.tags ?? [],
    type: row.type,
    width: row.width,
  };
}

function mapReviewRow(row: ReviewRow): Review {
  const decision = row.decision;

  return {
    assetId: row.asset_id,
    createdAt: row.created_at,
    decision,
    id: row.id,
    notes: row.notes ?? "",
    reviewerName: row.reviewer_name ?? "",
    scoreBrandFit: row.score_brand_fit ?? 0,
    scoreEditability: row.score_editability ?? 0,
    scoreHookStrength: row.score_hook_strength ?? 0,
    scoreMotionQuality: row.score_motion_quality ?? 0,
    scorePromptFidelity: row.score_prompt_fidelity ?? 0,
    scoreRealism: row.score_realism ?? 0,
    selectedBoolean: decision === "selected",
    shotId: row.shot_id,
  };
}

function mapPromptTemplateRow(row: PromptTemplateRow): PromptTemplate {
  return {
    actionTemplate: row.action_template,
    cameraTemplate: row.camera_template,
    category: row.category ?? "general",
    constraintsTemplate: row.constraints_template,
    createdAt: row.created_at,
    description: row.description ?? "",
    dialogueAudioTemplate: row.dialogue_audio_template,
    environmentTemplate: row.environment_template,
    finalTemplate: row.final_template ?? "",
    id: row.id,
    isSystem: row.is_system,
    lightingTemplate: row.lighting_template,
    moodTemplate: row.mood_template,
    name: row.name,
    subjectTemplate: row.subject_template,
    targetModel: row.target_model,
    visualStyleTemplate: row.visual_style_template,
  };
}

function mapShotGenerationRow(row: ShotGenerationRow): ShotGeneration {
  const responsePayload = asJsonObject(row.response_payload);
  const rawPayload = responsePayload.raw;
  const rawPayloadObject =
    rawPayload && typeof rawPayload === "object" && !Array.isArray(rawPayload)
      ? (rawPayload as Record<string, Json | undefined>)
      : {};
  const integrationMode =
    responsePayload.integration_mode === "live" ? "live" : "mock";
  const providerStatus =
    typeof responsePayload.provider_status === "string"
      ? responsePayload.provider_status
      : typeof rawPayloadObject.providerStatus === "string"
        ? rawPayloadObject.providerStatus
        : typeof rawPayloadObject.klingStatus === "string"
          ? rawPayloadObject.klingStatus
          : typeof rawPayloadObject.openaiStatus === "string"
            ? rawPayloadObject.openaiStatus
            : null;
  const progress =
    typeof responsePayload.progress === "number"
      ? responsePayload.progress
      : typeof rawPayloadObject.progress === "number"
        ? rawPayloadObject.progress
        : null;
  const providerMessage =
    typeof responsePayload.message === "string" ? responsePayload.message : null;

  return {
    aspectRatio: row.aspect_ratio,
    createdAt: row.created_at,
    durationSeconds: row.duration_seconds,
    generationNotes: row.generation_notes ?? "",
    id: row.id,
    integrationMode,
    outputUrl: row.output_url,
    progress,
    provider: row.provider,
    providerMessage,
    providerJobId: row.provider_job_id,
    providerStatus,
    requestPayload: asJsonObject(row.request_payload),
    responsePayload,
    seed: row.seed,
    shotId: row.shot_id,
    status: row.status,
    thumbnailUrl: row.thumbnail_url,
  };
}

async function loadLiveData() {
  const supabase = await createStudioReadClient();

  if (!supabase) {
    return null;
  }

  try {
    const [
      campaignsResult,
      shotsResult,
      assetsResult,
      reviewsResult,
      promptTemplatesResult,
      generationsResult,
    ] = await Promise.all([
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("shots").select("*").order("scene_number").order("shot_number"),
      supabase.from("assets").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase
        .from("prompt_templates")
        .select("*")
        .order("is_system", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("shot_generations").select("*").order("created_at", { ascending: false }),
    ]);

    if (
      campaignsResult.error ||
      shotsResult.error ||
      assetsResult.error ||
      reviewsResult.error ||
      promptTemplatesResult.error ||
      generationsResult.error
    ) {
      return null;
    }

    if (!campaignsResult.data || campaignsResult.data.length === 0) {
      return null;
    }

    const resolvedAssetRows = await resolveStorageBackedAssetRows(assetsResult.data);

    return {
      assets: resolvedAssetRows.map(mapAssetRow),
      campaigns: campaignsResult.data.map(mapCampaignRow),
      generations: generationsResult.data.map(mapShotGenerationRow),
      promptTemplates: promptTemplatesResult.data.map(mapPromptTemplateRow),
      reviews: reviewsResult.data.map(mapReviewRow),
      shots: shotsResult.data.map(mapShotRow),
    };
  } catch {
    return null;
  }
}

async function getWorkspaceData(): Promise<WorkspaceData> {
  const live = await loadLiveData();

  if (live) {
    return {
      ...live,
      mode: "live",
    };
  }

  return {
    assets: demoAssets,
    campaigns: demoCampaigns,
    generations: demoShotGenerations,
    mode: "demo",
    promptTemplates: demoPromptTemplates,
    reviews: demoReviews,
    shots: demoShots,
  };
}

export function isStudioPersistenceEnabled() {
  return hasStudioPersistenceEnv();
}

export async function getWorkspaceMode() {
  const data = await getWorkspaceData();
  return data.mode;
}

export async function getDashboardHomeData(): Promise<DashboardHomeData> {
  const data = await getWorkspaceData();
  const selectedCount = data.reviews.filter((review) => review.decision === "selected").length;

  return {
    mode: data.mode,
    recentCampaigns: [...data.campaigns]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
    recentShots: data.shots
      .map((shot) => ({
        ...shot,
        campaignName:
          data.campaigns.find((campaign) => campaign.id === shot.campaignId)?.name ??
          "Unknown campaign",
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6),
    stats: [
      {
        helper: "Campaigns currently being actively planned or produced.",
        label: "Active campaigns",
        value: `${data.campaigns.filter((campaign) => campaign.status !== "archived").length}`,
      },
      {
        helper: "Shots still moving through planning, generation, and review decisions.",
        label: "Shots in flight",
        value: `${data.shots.filter((shot) => !["selected", "rejected", "archived"].includes(shot.status)).length}`,
      },
      {
        helper: "Total assets tracked across references, generations, and delivery prep.",
        label: "Tracked assets",
        value: `${data.assets.length}`,
      },
      {
        helper: "Outputs currently marked as selects for edit and handoff.",
        label: "Selected outputs",
        value: `${selectedCount}`,
      },
    ],
  };
}

export async function listCampaigns() {
  const data = await getWorkspaceData();

  return {
    campaigns: [...data.campaigns].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    mode: data.mode,
  };
}

export async function listShots() {
  const data = await getWorkspaceData();

  return {
    mode: data.mode,
    shots: data.shots
      .map((shot) => ({
        ...shot,
        campaignName:
          data.campaigns.find((campaign) => campaign.id === shot.campaignId)?.name ??
          "Unknown campaign",
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export async function getCampaignDetail(campaignId: string): Promise<CampaignDetail | null> {
  const data = await getWorkspaceData();
  const campaign = data.campaigns.find((entry) => entry.id === campaignId);

  if (!campaign) {
    return null;
  }

  const shots = data.shots.filter((shot) => shot.campaignId === campaignId);
  const shotIds = new Set(shots.map((shot) => shot.id));
  const assets = data.assets.filter((asset) => asset.campaignId === campaignId);
  const reviews = data.reviews.filter((review) => shotIds.has(review.shotId));

  return {
    assets,
    campaign,
    mode: data.mode,
    reviews,
    shots,
  };
}

export async function getShotDetail(shotId: string): Promise<ShotDetail | null> {
  const data = await getWorkspaceData();
  const shot = data.shots.find((entry) => entry.id === shotId);

  if (!shot) {
    return null;
  }

  const campaign = data.campaigns.find((entry) => entry.id === shot.campaignId);

  if (!campaign) {
    return null;
  }

  const promptTemplates = data.promptTemplates.filter(
    (template) => !template.targetModel || template.targetModel === shot.targetModel,
  );

  return {
    assets: data.assets.filter(
      (asset) => asset.shotId === shot.id || asset.campaignId === campaign.id,
    ),
    campaign,
    generations: data.generations
      .filter((generation) => generation.shotId === shot.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    mode: data.mode,
    promptTemplates,
    reviews: data.reviews.filter((review) => review.shotId === shot.id),
    routingRecommendation: getRoutingRecommendation(shot),
    shot,
  };
}

export async function listAssets() {
  const data = await getWorkspaceData();

  return {
    assets: [...data.assets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    campaigns: data.campaigns,
    mode: data.mode,
    shots: data.shots,
  };
}

export async function getReviewsSummary(): Promise<ReviewsSummary> {
  const data = await getWorkspaceData();
  const reviews = data.reviews.map((review) => ({
    ...review,
    asset: data.assets.find((asset) => asset.id === review.assetId) ?? null,
    campaignName:
      data.campaigns.find(
        (campaign) =>
          campaign.id === data.shots.find((shot) => shot.id === review.shotId)?.campaignId,
      )?.name ?? "Unknown campaign",
    shot: data.shots.find((shot) => shot.id === review.shotId) ?? null,
  }));

  const average = (values: number[]) =>
    values.length === 0
      ? "0.0"
      : (values.reduce((total, value) => total + value, 0) / values.length).toFixed(1);

  return {
    averageBrandFit: average(reviews.map((review) => review.scoreBrandFit)),
    averageEditability: average(reviews.map((review) => review.scoreEditability)),
    averageHookStrength: average(reviews.map((review) => review.scoreHookStrength)),
    averageRealism: average(reviews.map((review) => review.scoreRealism)),
    mode: data.mode,
    rejectedCount: reviews.filter((review) => review.decision === "rejected").length,
    reviews,
    selectedCount: reviews.filter((review) => review.decision === "selected").length,
  };
}

export async function listPromptTemplates(targetModel?: TargetModel) {
  const data = await getWorkspaceData();

  const promptTemplates = targetModel
    ? data.promptTemplates.filter(
        (template) => !template.targetModel || template.targetModel === targetModel,
      )
    : data.promptTemplates;

  return {
    mode: data.mode,
    promptTemplates,
  };
}

export async function listShotGenerationsByShotId(shotId: string) {
  const data = await getWorkspaceData();

  return {
    generations: data.generations
      .filter((generation) => generation.shotId === shotId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    mode: data.mode,
  };
}
