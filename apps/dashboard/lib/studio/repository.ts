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
  AssetsWorkspace,
  Campaign,
  CampaignDetail,
  DashboardHomeData,
  HandoffPackage,
  PromptTemplate,
  Review,
  ReviewsSummary,
  Shot,
  ShotDetail,
  ShotGeneration,
  TargetModel,
  VersionCandidate,
  VersionGroup,
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
  const sortedAssets = [...data.assets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latestReviewByAssetId = new Map<string, Review>();
  const generationById = new Map(data.generations.map((generation) => [generation.id, generation]));
  const shotById = new Map(data.shots.map((shot) => [shot.id, shot]));
  const campaignById = new Map(data.campaigns.map((campaign) => [campaign.id, campaign]));

  for (const review of [...data.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    if (!latestReviewByAssetId.has(review.assetId)) {
      latestReviewByAssetId.set(review.assetId, review);
    }
  }

  const average = (values: number[]) =>
    values.length === 0
      ? "0.0"
      : (values.reduce((total, value) => total + value, 0) / values.length).toFixed(1);

  const generatedVideoAssets = sortedAssets.filter((asset) => asset.type === "generated_video");
  const thumbnailByGenerationId = new Map<string, Asset>();

  for (const asset of sortedAssets) {
    if (asset.type === "thumbnail" && asset.generationId && !thumbnailByGenerationId.has(asset.generationId)) {
      thumbnailByGenerationId.set(asset.generationId, asset);
    }
  }

  const versionCandidates: VersionCandidate[] = generatedVideoAssets.map((asset) => {
    const review = latestReviewByAssetId.get(asset.id) ?? null;
    const shot = asset.shotId ? shotById.get(asset.shotId) ?? null : null;
    const campaign = campaignById.get(asset.campaignId) ?? null;
    const generation = asset.generationId ? generationById.get(asset.generationId) ?? null : null;
    const provider = generation?.provider ?? shot?.targetModel ?? null;
    const averageScore = review
      ? Number(
          (
            [
              review.scoreBrandFit,
              review.scoreEditability,
              review.scoreHookStrength,
              review.scoreMotionQuality,
              review.scorePromptFidelity,
              review.scoreRealism,
            ].reduce((total, value) => total + value, 0) / 6
          ).toFixed(1),
        )
      : null;

    return {
      asset,
      averageScore,
      campaign,
      createdAt: asset.createdAt,
      generation,
      id: asset.id,
      provider,
      review,
      shot,
      thumbnailAsset: asset.generationId ? thumbnailByGenerationId.get(asset.generationId) ?? null : null,
    };
  });

  const versionGroupsMap = new Map<string, VersionCandidate[]>();

  for (const candidate of versionCandidates) {
    const key = candidate.shot?.id ?? `asset:${candidate.asset.id}`;
    const existing = versionGroupsMap.get(key) ?? [];
    existing.push(candidate);
    versionGroupsMap.set(key, existing);
  }

  const versionGroups: VersionGroup[] = Array.from(versionGroupsMap.values())
    .map((entries) => {
      const sortedCandidates = [...entries].sort((left, right) => {
        const leftSelected = left.review?.decision === "selected" ? 1 : 0;
        const rightSelected = right.review?.decision === "selected" ? 1 : 0;

        if (rightSelected !== leftSelected) {
          return rightSelected - leftSelected;
        }

        if ((right.averageScore ?? -1) !== (left.averageScore ?? -1)) {
          return (right.averageScore ?? -1) - (left.averageScore ?? -1);
        }

        return right.createdAt.localeCompare(left.createdAt);
      });

      return {
        averageScore: average(
          sortedCandidates
            .map((candidate) => candidate.averageScore)
            .filter((score): score is number => score !== null),
        ),
        campaign: sortedCandidates[0]?.campaign ?? null,
        candidateCount: sortedCandidates.length,
        latestCreatedAt: sortedCandidates[0]?.createdAt ?? "",
        pendingReviewCount: sortedCandidates.filter(
          (candidate) =>
            !candidate.review ||
            candidate.review.decision === "pending" ||
            candidate.review.decision === "hold",
        ).length,
        readyForHandoff: sortedCandidates.some(
          (candidate) => candidate.review?.decision === "selected",
        ),
        selectedCandidateId:
          sortedCandidates.find((candidate) => candidate.review?.decision === "selected")?.id ??
          sortedCandidates[0]?.id ??
          null,
        selectedCount: sortedCandidates.filter(
          (candidate) => candidate.review?.decision === "selected",
        ).length,
        shot: sortedCandidates[0]?.shot ?? null,
        versionCandidates: sortedCandidates,
      };
    })
    .sort((left, right) => {
      if (Number(right.readyForHandoff) !== Number(left.readyForHandoff)) {
        return Number(right.readyForHandoff) - Number(left.readyForHandoff);
      }

      return right.latestCreatedAt.localeCompare(left.latestCreatedAt);
    });

  const selectedVersionByShotId = new Map<string, VersionCandidate>();

  for (const group of versionGroups) {
    const shotId = group.shot?.id;

    if (!shotId) {
      continue;
    }

    const selectedVersion = group.versionCandidates.find(
      (candidate) => candidate.review?.decision === "selected",
    );

    if (selectedVersion) {
      selectedVersionByShotId.set(shotId, selectedVersion);
    }
  }

  const handoffPackages: HandoffPackage[] = data.campaigns
    .map((campaign) => {
      const campaignShots = data.shots.filter((shot) => shot.campaignId === campaign.id);
      const campaignVersionGroups = versionGroups.filter(
        (group) => group.campaign?.id === campaign.id,
      );
      const selectedVersions = campaignVersionGroups.flatMap((group) =>
        group.versionCandidates.filter((candidate) => candidate.review?.decision === "selected"),
      );
      const pendingReviewCount = campaignVersionGroups.reduce(
        (total, group) => total + group.pendingReviewCount,
        0,
      );
      const missingShots = campaignShots.filter((shot) => !selectedVersionByShotId.has(shot.id));
      const editorNotes = Array.from(
        new Set(
          selectedVersions
            .map((candidate) => candidate.shot?.notes?.trim() ?? "")
            .filter((note) => note.length > 0),
        ),
      ).slice(0, 4);

      const deliverableChecklist = [
        `${selectedVersions.length} selected ${selectedVersions.length === 1 ? "output" : "outputs"} ready`,
        `${pendingReviewCount} ${pendingReviewCount === 1 ? "candidate still needs" : "candidates still need"} review attention`,
        `${missingShots.length} ${missingShots.length === 1 ? "shot is still missing a select" : "shots are still missing selects"}`,
      ];

      return {
        campaign,
        deliverableChecklist,
        editorNotes,
        exportReady: selectedVersions.length > 0,
        id: campaign.id,
        missingShotCount: missingShots.length,
        missingShots,
        pendingReviewCount,
        selectedVersions: selectedVersions.sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
      };
    })
    .sort((left, right) => {
      if (Number(right.exportReady) !== Number(left.exportReady)) {
        return Number(right.exportReady) - Number(left.exportReady);
      }

      return right.selectedVersions.length - left.selectedVersions.length;
    });

  const workspace: AssetsWorkspace = {
    assets: sortedAssets,
    campaigns: data.campaigns,
    handoffPackages,
    mode: data.mode,
    shots: data.shots,
    versionGroups,
  };

  return workspace;
}

export async function getReviewsSummary(): Promise<ReviewsSummary> {
  const data = await getWorkspaceData();

  const average = (values: number[]) =>
    values.length === 0
      ? "0.0"
      : (values.reduce((total, value) => total + value, 0) / values.length).toFixed(1);

  const decisionCounts: ReviewsSummary["decisionCounts"] = {
    hold: 0,
    pending: 0,
    rejected: 0,
    selected: 0,
  };
  const providerCounts: ReviewsSummary["providerCounts"] = {
    higgsfield: 0,
    kling: 0,
    sora: 0,
  };

  const reviews: ReviewsSummary["reviews"] = data.reviews.map((review) => {
    const asset = data.assets.find((entry) => entry.id === review.assetId) ?? null;
    const shot = data.shots.find((entry) => entry.id === review.shotId) ?? null;
    const campaign = shot
      ? data.campaigns.find((entry) => entry.id === shot.campaignId) ?? null
      : null;
    const generation =
      (asset?.generationId
        ? data.generations.find((entry) => entry.id === asset.generationId) ?? null
        : null) ??
      data.generations.find((entry) => entry.shotId === review.shotId) ??
      null;
    const provider = generation?.provider ?? shot?.targetModel ?? null;
    const averageScore = Number(
      (
        [
          review.scoreBrandFit,
          review.scoreEditability,
          review.scoreHookStrength,
          review.scoreMotionQuality,
          review.scorePromptFidelity,
          review.scoreRealism,
        ].reduce((total, value) => total + value, 0) / 6
      ).toFixed(1),
    );

    decisionCounts[review.decision] += 1;

    if (provider) {
      providerCounts[provider] += 1;
    }

    return {
      ...review,
      asset,
      averageScore,
      campaign,
      campaignName: campaign?.name ?? "Unknown campaign",
      generation,
      provider,
      shot,
    };
  });

  const decisionPriority: Record<string, number> = {
    selected: 0,
    pending: 1,
    hold: 2,
    rejected: 3,
  };

  const comparisonGroupsMap = new Map<string, ReviewsSummary["reviews"]>();

  for (const review of reviews) {
    const existing = comparisonGroupsMap.get(review.shotId) ?? [];
    existing.push(review);
    comparisonGroupsMap.set(review.shotId, existing);
  }

  const comparisonGroups: ReviewsSummary["compareGroups"] = Array.from(
    comparisonGroupsMap.values(),
  )
    .map((entries) => {
      const comparisonCandidates = [...entries].sort((left, right) => {
        const leftDecisionPriority = decisionPriority[left.decision] ?? 99;
        const rightDecisionPriority = decisionPriority[right.decision] ?? 99;

        if (leftDecisionPriority !== rightDecisionPriority) {
          return leftDecisionPriority - rightDecisionPriority;
        }

        if (right.averageScore !== left.averageScore) {
          return right.averageScore - left.averageScore;
        }

        return right.createdAt.localeCompare(left.createdAt);
      });

      return {
        averageScore: average(comparisonCandidates.map((candidate) => candidate.averageScore)),
        campaign: comparisonCandidates[0]?.campaign ?? null,
        candidateCount: comparisonCandidates.length,
        comparisonCandidates,
        latestReviewAt: comparisonCandidates.reduce(
          (latest, candidate) =>
            candidate.createdAt > latest ? candidate.createdAt : latest,
          comparisonCandidates[0]?.createdAt ?? "",
        ),
        selectedCount: comparisonCandidates.filter(
          (candidate) => candidate.decision === "selected",
        ).length,
        shot: comparisonCandidates[0]?.shot ?? null,
        topCandidateId: comparisonCandidates[0]?.id ?? null,
      };
    })
    .sort((left, right) => {
      if (right.selectedCount !== left.selectedCount) {
        return right.selectedCount - left.selectedCount;
      }

      if (Number.parseFloat(right.averageScore) !== Number.parseFloat(left.averageScore)) {
        return Number.parseFloat(right.averageScore) - Number.parseFloat(left.averageScore);
      }

      return right.latestReviewAt.localeCompare(left.latestReviewAt);
    });

  return {
    averageBrandFit: average(reviews.map((review) => review.scoreBrandFit)),
    averageEditability: average(reviews.map((review) => review.scoreEditability)),
    averageHookStrength: average(reviews.map((review) => review.scoreHookStrength)),
    averageRealism: average(reviews.map((review) => review.scoreRealism)),
    compareGroups: comparisonGroups,
    decisionCounts,
    mode: data.mode,
    providerCounts,
    rejectedCount: decisionCounts.rejected,
    reviews,
    selectedCount: decisionCounts.selected,
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
