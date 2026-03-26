import type { Database } from "@/types/database";

import { createStudioWriteClient } from "@/lib/db/client";
import { maybeMirrorGeneratedAssetToStorage } from "@/lib/db/generated-asset-storage";
import type { SaveShotPromptDraftInput } from "@/lib/db/shots";
import { saveShotPromptDraft } from "@/lib/db/shots";
import { createAdminSupabaseClient, isSupabaseAdminAvailable } from "@/lib/supabase/admin";
import { getProvider } from "@/lib/providers/router";
import type { GenerationJob } from "@/lib/studio/providers/types";
import { parseStoragePointer } from "@/lib/utils/storage";

function resolveNextShotStatus(status: string): Database["public"]["Enums"]["shot_status"] {
  switch (status) {
    case "running":
      return "generating";
    case "succeeded":
      return "generated";
    case "failed":
      return "prompt_ready";
    default:
      return "queued";
  }
}

function asJsonObject(
  value: Database["public"]["Tables"]["shot_generations"]["Row"]["response_payload"],
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, Database["public"]["Tables"]["shot_generations"]["Row"]["response_payload"]>;
  }

  return value as Record<string, Database["public"]["Tables"]["shot_generations"]["Row"]["response_payload"]>;
}

function asAssetMetadataRecord(
  value: Database["public"]["Tables"]["assets"]["Row"]["metadata_json"] | null | undefined,
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  return value as Record<string, unknown>;
}

function getProviderLabel(provider: GenerationJob["provider"]) {
  switch (provider) {
    case "sora":
      return "OpenAI Sora";
    case "kling":
      return "Kling";
    case "higgsfield":
      return "Higgsfield";
  }
}

function extractProviderProgress(job: GenerationJob) {
  return typeof job.raw?.progress === "number" ? job.raw.progress : null;
}

function extractProviderStatus(job: GenerationJob) {
  if (typeof job.raw?.providerStatus === "string") {
    return job.raw.providerStatus;
  }

  if (typeof job.raw?.klingStatus === "string") {
    return job.raw.klingStatus;
  }

  if (typeof job.raw?.openaiStatus === "string") {
    return job.raw.openaiStatus;
  }

  return job.status;
}

function extractOutputUrl(job: GenerationJob) {
  return typeof job.outputUrl === "string" && job.outputUrl.trim().length > 0
    ? job.outputUrl
    : null;
}

function extractThumbnailUrl(job: GenerationJob) {
  return typeof job.thumbnailUrl === "string" && job.thumbnailUrl.trim().length > 0
    ? job.thumbnailUrl
    : null;
}

function sanitizeFileSegment(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : "asset";
}

function inferFileExtensionFromUrl(
  fileUrl: string,
  fallbackExtension: "jpg" | "mp4",
) {
  try {
    const pathname = new URL(fileUrl).pathname;
    const match = pathname.match(/\.([a-z0-9]{2,5})$/i);

    if (match?.[1]) {
      return match[1].toLowerCase();
    }
  } catch {
    // Ignore invalid URL parsing and fall back.
  }

  return fallbackExtension;
}

function inferMimeType(
  assetType: Database["public"]["Tables"]["assets"]["Row"]["type"],
  fileUrl: string,
) {
  const extension = inferFileExtensionFromUrl(
    fileUrl,
    assetType === "generated_video" ? "mp4" : "jpg",
  );

  switch (extension) {
    case "mov":
      return "video/quicktime";
    case "webm":
      return "video/webm";
    case "mp4":
      return "video/mp4";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return assetType === "generated_video" ? "video/mp4" : "image/jpeg";
  }
}

function buildGeneratedAssetFileName(input: {
  assetType: Database["public"]["Tables"]["assets"]["Row"]["type"];
  fileUrl: string;
  generationId: string;
  provider: GenerationJob["provider"];
  shotTitle: string;
}) {
  const extension = inferFileExtensionFromUrl(
    input.fileUrl,
    input.assetType === "generated_video" ? "mp4" : "jpg",
  );
  const shotSegment = sanitizeFileSegment(input.shotTitle);
  const providerSegment = sanitizeFileSegment(input.provider);
  const generationSegment = sanitizeFileSegment(input.generationId).slice(0, 12);
  const suffix = input.assetType === "generated_video" ? "render" : "thumbnail";

  return `${shotSegment}-${providerSegment}-${generationSegment}-${suffix}.${extension}`;
}

function extractProviderMessage(job: GenerationJob) {
  if (typeof job.raw?.message === "string") {
    return job.raw.message;
  }

  return job.integrationMode === "live"
    ? "Provider request accepted."
    : "Provider stub ready for real API wiring.";
}

function buildGenerationNote(job: GenerationJob, title: string) {
  const providerLabel = getProviderLabel(job.provider);

  if (job.integrationMode === "live") {
    const model =
      typeof job.raw?.model === "string" ? ` via ${job.raw.model}` : "";
    const size =
      typeof job.raw?.resolvedSize === "string"
        ? ` at ${job.raw.resolvedSize}`
        : typeof job.raw?.resolvedAspectRatio === "string"
          ? ` in ${job.raw.resolvedAspectRatio}`
          : "";
    const seconds =
      typeof job.raw?.resolvedSeconds === "number"
        ? ` for ${job.raw.resolvedSeconds}s`
        : typeof job.raw?.resolvedDurationSeconds === "string"
          ? ` for ${job.raw.resolvedDurationSeconds}s`
          : "";

    return `Live ${providerLabel}${model} render requested for ${title}${size}${seconds}.`;
  }

  return `Mock ${providerLabel} generation recorded for ${title}.`;
}

function buildStatusSyncNote(job: GenerationJob, title: string) {
  const providerLabel = getProviderLabel(job.provider);

  if (job.integrationMode === "live") {
    switch (job.status) {
      case "succeeded":
        return `${providerLabel} render for ${title} completed. Asset ingestion is the next step.`;
      case "failed":
        return `${providerLabel} render for ${title} failed. Review the provider response before retrying.`;
      case "running":
        return `${providerLabel} render for ${title} is still processing.`;
      default:
        return `${providerLabel} render for ${title} remains queued.`;
    }
  }

  return `Mock ${providerLabel} status refreshed for ${title}.`;
}

function formatReferenceAssetType(
  assetType: Database["public"]["Tables"]["assets"]["Row"]["type"],
) {
  switch (assetType) {
    case "reference_image":
      return "Reference image";
    case "reference_video":
      return "Reference video";
    case "product_image":
      return "Product image";
    case "character_sheet":
      return "Character sheet";
    case "moodboard":
      return "Moodboard";
    case "logo":
      return "Logo";
    default:
      return assetType.replaceAll("_", " ");
  }
}

function buildReferenceContextLine(asset: {
  file_name: string;
  metadata_json: Database["public"]["Tables"]["assets"]["Row"]["metadata_json"];
  tags?: string[] | null;
  type: Database["public"]["Tables"]["assets"]["Row"]["type"];
}) {
  const metadata = asAssetMetadataRecord(asset.metadata_json);
  const label =
    typeof metadata.sample_title === "string" && metadata.sample_title.trim().length > 0
      ? metadata.sample_title.trim()
      : asset.file_name;
  const sourceLabel =
    typeof metadata.source_label === "string" && metadata.source_label.trim().length > 0
      ? metadata.source_label.trim()
      : typeof metadata.import_mode === "string" && metadata.import_mode.trim().length > 0
        ? metadata.import_mode.trim().replaceAll("_", " ")
        : null;
  const tags = Array.isArray(asset.tags)
    ? asset.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0).slice(0, 4)
    : [];
  const details = [
    sourceLabel ? `source ${sourceLabel}` : null,
    tags.length > 0 ? `tags ${tags.join(", ")}` : null,
  ].filter((value): value is string => Boolean(value));

  return `- ${formatReferenceAssetType(asset.type)}: ${label}${details.length > 0 ? ` (${details.join("; ")})` : ""}`;
}

function buildProviderPromptText(
  promptText: string,
  referenceAssets: Array<{
    file_name: string;
    metadata_json: Database["public"]["Tables"]["assets"]["Row"]["metadata_json"];
    tags?: string[] | null;
    type: Database["public"]["Tables"]["assets"]["Row"]["type"];
  }>,
) {
  if (referenceAssets.length === 0) {
    return promptText;
  }

  const referenceLines = referenceAssets.slice(0, 4).map(buildReferenceContextLine);

  return `${promptText}\n\nReference direction:\nUse the attached references as visual guidance for styling, composition, tone, and motion intent while preserving brand fidelity.\n${referenceLines.join("\n")}`;
}

async function resolveProviderReferenceAssetUrls(
  assets: Array<{
    file_url: string;
    metadata_json: Database["public"]["Tables"]["assets"]["Row"]["metadata_json"];
  }>,
) {
  const admin = isSupabaseAdminAvailable() ? createAdminSupabaseClient() : null;
  const resolvedUrls = await Promise.all(
    assets.map(async (asset) => {
      const storagePointer = parseStoragePointer(asset.file_url);

      if (!storagePointer) {
        return asset.file_url;
      }

      if (!admin) {
        if (
          asset.metadata_json &&
          typeof asset.metadata_json === "object" &&
          !Array.isArray(asset.metadata_json) &&
          typeof asset.metadata_json.provider_source_url === "string"
        ) {
          return asset.metadata_json.provider_source_url;
        }

        return null;
      }

      const signedUrlResult = await admin.storage
        .from(storagePointer.bucket)
        .createSignedUrl(storagePointer.objectPath, 60 * 60);

      if (!signedUrlResult.error && signedUrlResult.data?.signedUrl) {
        return signedUrlResult.data.signedUrl;
      }

      return null;
    }),
  );

  return resolvedUrls.filter((value): value is string => Boolean(value));
}

async function syncCompletedGenerationAssets(input: {
  campaignId: string;
  generation: Database["public"]["Tables"]["shot_generations"]["Row"];
  job: GenerationJob;
  shotTitle: string;
  supabase: Awaited<ReturnType<typeof createStudioWriteClient>>;
}) {
  const { campaignId, generation, job, shotTitle, supabase } = input;

  if (!supabase || job.integrationMode !== "live" || job.status !== "succeeded") {
    return 0;
  }

  const outputUrl = extractOutputUrl(job);
  const thumbnailUrl = extractThumbnailUrl(job);

  if (!outputUrl && !thumbnailUrl) {
    return 0;
  }

  const { data: existingAssets, error: existingAssetsError } = await supabase
    .from("assets")
    .select("file_url, id, metadata_json, type")
    .eq("generation_id", generation.id)
    .in("type", ["generated_video", "thumbnail"]);

  if (existingAssetsError) {
    throw existingAssetsError;
  }

  const existingAssetByType = new Map(
    (existingAssets ?? []).map((asset) => [asset.type, asset]),
  );

  const providerStatus = extractProviderStatus(job);
  const syncedAt = new Date().toISOString();
  const assetPlans: Array<{
    assetType: "generated_video" | "thumbnail";
    durationSeconds: number | null;
    fileUrl: string;
    tags: string[];
  }> = [];

  if (outputUrl) {
    assetPlans.push({
      assetType: "generated_video",
      durationSeconds: generation.duration_seconds,
      fileUrl: outputUrl,
      tags: ["generated", job.provider, "auto-synced"],
    });
  }

  if (thumbnailUrl) {
    assetPlans.push({
      assetType: "thumbnail",
      durationSeconds: null,
      fileUrl: thumbnailUrl,
      tags: ["thumbnail", job.provider, "auto-synced"],
    });
  }

  let syncedCount = 0;

  for (const plan of assetPlans) {
    const fileName = buildGeneratedAssetFileName({
      assetType: plan.assetType,
      fileUrl: plan.fileUrl,
      generationId: generation.id,
      provider: job.provider,
      shotTitle,
    });
    const storageSyncStatus = isSupabaseAdminAvailable() ? "pending" : "skipped";
    const existingAssetRecord = existingAssetByType.get(plan.assetType);
    const existingMetadata = asAssetMetadataRecord(existingAssetRecord?.metadata_json);
    const existingFileUrl = existingAssetRecord?.file_url ?? null;
    const existingStoragePointer = existingFileUrl ? parseStoragePointer(existingFileUrl) : null;
    const preserveStoragePointer =
      Boolean(existingStoragePointer) &&
      existingMetadata.storage_sync_status === "synced" &&
      existingMetadata.provider_source_url === plan.fileUrl;
    const metadataJson: Database["public"]["Tables"]["assets"]["Insert"]["metadata_json"] = {
      aspect_ratio: generation.aspect_ratio,
      asset_role: plan.assetType,
      auto_synced: true,
      duration_seconds: plan.durationSeconds,
      generation_id: generation.id,
      generation_status: job.status,
      integration_mode: job.integrationMode,
      provider: job.provider,
      provider_job_id: generation.provider_job_id,
      provider_status: providerStatus,
      provider_source_url: plan.fileUrl,
      storage_bucket:
        typeof existingMetadata.storage_bucket === "string"
          ? existingMetadata.storage_bucket
          : null,
      storage_object_path:
        typeof existingMetadata.storage_object_path === "string"
          ? existingMetadata.storage_object_path
          : null,
      storage_synced_at:
        typeof existingMetadata.storage_synced_at === "string"
          ? existingMetadata.storage_synced_at
          : null,
      storage_sync_error:
        typeof existingMetadata.storage_sync_error === "string"
          ? existingMetadata.storage_sync_error
          : null,
      storage_sync_status:
        preserveStoragePointer &&
        typeof existingMetadata.storage_sync_status === "string"
          ? existingMetadata.storage_sync_status
          : storageSyncStatus,
      synced_at: syncedAt,
    };
    const persistedFileUrl =
      preserveStoragePointer && existingFileUrl
        ? existingFileUrl
        : plan.fileUrl;
    const existingAssetId = existingAssetRecord?.id ?? null;
    let assetId = existingAssetId ?? null;
    const mimeType = inferMimeType(plan.assetType, plan.fileUrl);

    if (existingAssetId) {
      const updatePayload: Database["public"]["Tables"]["assets"]["Update"] = {
        campaign_id: campaignId,
        duration_seconds: plan.durationSeconds,
        file_name: fileName,
        file_url: persistedFileUrl,
        metadata_json: metadataJson,
        mime_type: mimeType,
        shot_id: generation.shot_id,
        source: "generated",
        tags: plan.tags,
      };

      const { error } = await supabase
        .from("assets")
        .update(updatePayload)
        .eq("id", existingAssetId);

      if (error) {
        throw error;
      }
    } else {
      const insertPayload: Database["public"]["Tables"]["assets"]["Insert"] = {
        campaign_id: campaignId,
        duration_seconds: plan.durationSeconds,
        file_name: fileName,
        file_url: persistedFileUrl,
        generation_id: generation.id,
        metadata_json: metadataJson,
        mime_type: mimeType,
        shot_id: generation.shot_id,
        source: "generated",
        tags: plan.tags,
        type: plan.assetType,
      };

      const { data: insertedAsset, error } = await supabase
        .from("assets")
        .insert(insertPayload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      assetId = insertedAsset.id;
    }

    if (assetId) {
      await maybeMirrorGeneratedAssetToStorage({
        assetId,
        campaignId,
        fileName,
        generationId: generation.id,
        metadataJson,
        mimeType,
        shotId: generation.shot_id,
        sourceUrl: plan.fileUrl,
      });
    }

    syncedCount += 1;
  }

  return syncedCount;
}

export async function triggerShotGeneration(input: SaveShotPromptDraftInput) {
  const updatedShot = await saveShotPromptDraft(input);
  const supabase = await createStudioWriteClient();

  if (!supabase) {
    throw new Error(
      "Supabase operator access is not configured yet, so generation requests are unavailable in this environment.",
    );
  }

  const { data: referenceAssets, error: assetsError } = await supabase
    .from("assets")
    .select("file_name, file_url, metadata_json, shot_id, tags, type")
    .eq("campaign_id", updatedShot.campaign_id);

  if (assetsError) {
    throw assetsError;
  }

  const candidateReferenceAssets =
    referenceAssets?.filter(
      (asset) =>
        (asset.shot_id === input.shotId || asset.shot_id === null) &&
        (asset.type === "reference_image" ||
          asset.type === "reference_video" ||
          asset.type === "product_image" ||
          asset.type === "character_sheet" ||
          asset.type === "moodboard" ||
          asset.type === "logo"),
    ) ?? [];
  const referenceAssetUrls = await resolveProviderReferenceAssetUrls(candidateReferenceAssets);
  const providerPromptText = buildProviderPromptText(input.promptText, candidateReferenceAssets);

  const provider = getProvider(input.targetModel);
  const job = await provider.enqueue({
    aspectRatio: input.aspectRatio,
    campaignId: updatedShot.campaign_id,
    durationSeconds: input.durationSeconds,
    promptText: providerPromptText,
    referenceAssetUrls,
    shotId: input.shotId,
  });

  const generationPayload: Database["public"]["Tables"]["shot_generations"]["Insert"] = {
    aspect_ratio: input.aspectRatio,
    duration_seconds: input.durationSeconds,
    generation_notes: buildGenerationNote(job, input.title),
    output_url: extractOutputUrl(job),
    provider: input.targetModel,
    provider_job_id: job.id,
    request_payload: {
      aspect_ratio: input.aspectRatio,
      duration_seconds: input.durationSeconds,
      prompt_text: input.promptText,
      provider_prompt_text: providerPromptText,
      provider: input.targetModel,
      reference_asset_urls: referenceAssetUrls,
      shot_id: input.shotId,
    },
    response_payload: {
      integration_mode: job.integrationMode,
      message: extractProviderMessage(job),
      provider: job.provider,
      progress: extractProviderProgress(job),
      provider_status: extractProviderStatus(job),
      raw: job.raw ?? {},
      status: job.status,
    },
    shot_id: input.shotId,
    status: job.status,
    thumbnail_url: extractThumbnailUrl(job),
  };

  const { data: generation, error: generationError } = await supabase
    .from("shot_generations")
    .insert(generationPayload)
    .select("*")
    .single();

  if (generationError) {
    throw generationError;
  }

  const { error: shotUpdateError } = await supabase
    .from("shots")
    .update({ status: resolveNextShotStatus(job.status) })
    .eq("id", input.shotId);

  if (shotUpdateError) {
    throw shotUpdateError;
  }

  const activityPayload: Database["public"]["Tables"]["activity_log"]["Insert"] = {
    action: "generation_requested",
    entity_id: generation.id,
    entity_type: "shot_generation",
    payload: {
      integration_mode: job.integrationMode,
      provider: input.targetModel,
      shot_id: input.shotId,
      status: job.status,
    },
  };

  const { error: activityError } = await supabase.from("activity_log").insert(activityPayload);

  if (activityError) {
    throw activityError;
  }

  const syncedAssetsCount = await syncCompletedGenerationAssets({
    campaignId: updatedShot.campaign_id,
    generation,
    job,
    shotTitle: input.title,
    supabase,
  });

  if (syncedAssetsCount > 0) {
    const { error: assetSyncActivityError } = await supabase.from("activity_log").insert({
      action: "generation_assets_synced",
      entity_id: generation.id,
      entity_type: "shot_generation",
      payload: {
        asset_count: syncedAssetsCount,
        provider: job.provider,
        shot_id: input.shotId,
        status: job.status,
      },
    });

    if (assetSyncActivityError) {
      throw assetSyncActivityError;
    }
  }

  return {
    generation,
    job,
    syncedAssetsCount,
  };
}

export async function refreshShotGenerationStatus(generationId: string) {
  const supabase = await createStudioWriteClient();

  if (!supabase) {
    throw new Error(
      "Supabase operator access is not configured yet, so generation refresh is unavailable in this environment.",
    );
  }

  const { data: generation, error: generationError } = await supabase
    .from("shot_generations")
    .select("id, provider, provider_job_id, response_payload, shot_id, status")
    .eq("id", generationId)
    .single();

  if (generationError || !generation) {
    throw generationError ?? new Error("Generation record not found.");
  }

  if (!generation.provider_job_id) {
    throw new Error("This generation does not have a provider job id to refresh.");
  }

  const { data: shot, error: shotError } = await supabase
    .from("shots")
    .select("campaign_id, id, title")
    .eq("id", generation.shot_id)
    .single();

  if (shotError || !shot) {
    throw shotError ?? new Error("Shot not found for generation.");
  }

  const provider = getProvider(generation.provider);
  const job = await provider.getJob(generation.provider_job_id);
  const existingResponsePayload = asJsonObject(generation.response_payload);

  const updatePayload: Database["public"]["Tables"]["shot_generations"]["Update"] = {
    generation_notes: buildStatusSyncNote(job, shot.title),
    output_url: extractOutputUrl(job),
    response_payload: {
      ...existingResponsePayload,
      integration_mode: job.integrationMode,
      message: extractProviderMessage(job),
      provider: job.provider,
      progress: extractProviderProgress(job),
      provider_status: extractProviderStatus(job),
      raw: job.raw ?? {},
      status: job.status,
    },
    status: job.status,
    thumbnail_url: extractThumbnailUrl(job),
  };

  const { data: refreshedGeneration, error: refreshError } = await supabase
    .from("shot_generations")
    .update(updatePayload)
    .eq("id", generationId)
    .select("*")
    .single();

  if (refreshError || !refreshedGeneration) {
    throw refreshError ?? new Error("Unable to refresh generation status.");
  }

  const { error: shotUpdateError } = await supabase
    .from("shots")
    .update({ status: resolveNextShotStatus(job.status) })
    .eq("id", generation.shot_id);

  if (shotUpdateError) {
    throw shotUpdateError;
  }

  const activityPayload: Database["public"]["Tables"]["activity_log"]["Insert"] = {
    action: "generation_status_synced",
    entity_id: refreshedGeneration.id,
    entity_type: "shot_generation",
    payload: {
      integration_mode: job.integrationMode,
      provider: job.provider,
      shot_id: generation.shot_id,
      status: job.status,
    },
  };

  const { error: activityError } = await supabase.from("activity_log").insert(activityPayload);

  if (activityError) {
    throw activityError;
  }

  const syncedAssetsCount = await syncCompletedGenerationAssets({
    campaignId: shot.campaign_id,
    generation: refreshedGeneration,
    job,
    shotTitle: shot.title,
    supabase,
  });

  if (syncedAssetsCount > 0) {
    const { error: assetSyncActivityError } = await supabase.from("activity_log").insert({
      action: "generation_assets_synced",
      entity_id: refreshedGeneration.id,
      entity_type: "shot_generation",
      payload: {
        asset_count: syncedAssetsCount,
        provider: job.provider,
        shot_id: generation.shot_id,
        status: job.status,
      },
    });

    if (assetSyncActivityError) {
      throw assetSyncActivityError;
    }
  }

  return {
    generation: refreshedGeneration,
    job,
    shotId: generation.shot_id,
    syncedAssetsCount,
  };
}
