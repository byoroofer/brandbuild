import "server-only";

import { createAdminSupabaseClient, isSupabaseAdminAvailable } from "@/lib/supabase/admin";
import {
  buildGeneratedAssetStoragePath,
  createStoragePointer,
  parseStoragePointer,
} from "@/lib/utils/storage";
import type { Database, Json } from "@/types/database";

function getAssetsStorageBucket() {
  const value = (process.env.STORAGE_BUCKET_ASSETS ?? "assets").trim();
  return value.length > 0 ? value : "assets";
}

function isRemoteHttpUrl(fileUrl: string) {
  return /^https?:\/\//i.test(fileUrl);
}

function isOpenAiVideoContentUrl(fileUrl: string) {
  try {
    const parsed = new URL(fileUrl);
    return (
      parsed.hostname === "api.openai.com" &&
      /^\/v1\/videos\/[^/]+\/content$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

function buildRemoteFetchHeaders(fileUrl: string) {
  if (isOpenAiVideoContentUrl(fileUrl)) {
    const apiKey = process.env.OPENAI_API_KEY?.trim() || process.env.SORA_API_KEY?.trim();

    if (!apiKey) {
      throw new Error("OpenAI content sync requires OPENAI_API_KEY.");
    }

    return {
      Authorization: `Bearer ${apiKey}`,
    };
  }

  return undefined;
}

function asMetadataObject(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, Json | undefined>;
  }

  return value as Record<string, Json | undefined>;
}

export async function maybeMirrorGeneratedAssetToStorage(input: {
  assetId: string;
  campaignId: string;
  fileName: string;
  generationId: string;
  metadataJson: Database["public"]["Tables"]["assets"]["Insert"]["metadata_json"];
  mimeType: string | null;
  shotId?: string | null;
  sourceUrl: string;
}) {
  if (!isSupabaseAdminAvailable() || !isRemoteHttpUrl(input.sourceUrl)) {
    return {
      mirrored: false,
      reason: !isSupabaseAdminAvailable() ? "admin-unavailable" : "not-remote-url",
    };
  }

  const admin = createAdminSupabaseClient();
  const { data: existingAsset, error: existingAssetError } = await admin
    .from("assets")
    .select("file_url, metadata_json")
    .eq("id", input.assetId)
    .single();

  if (existingAssetError || !existingAsset) {
    return {
      mirrored: false,
      reason: "asset-not-found",
    };
  }

  const existingMetadata = asMetadataObject(existingAsset.metadata_json);
  const storagePointer = parseStoragePointer(existingAsset.file_url);

  if (
    storagePointer &&
    typeof existingMetadata.provider_source_url === "string" &&
    existingMetadata.provider_source_url === input.sourceUrl &&
    existingMetadata.storage_sync_status === "synced"
  ) {
    return {
      mirrored: true,
      objectPath: storagePointer.objectPath,
      reason: "already-synced",
    };
  }

  try {
    const response = await fetch(input.sourceUrl, {
      cache: "no-store",
      headers: buildRemoteFetchHeaders(input.sourceUrl),
    });

    if (!response.ok) {
      throw new Error(`Remote asset download failed with status ${response.status}.`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? input.mimeType ?? undefined;
    const bucket = getAssetsStorageBucket();
    const objectPath = buildGeneratedAssetStoragePath({
      campaignId: input.campaignId,
      fileName: input.fileName,
      generationId: input.generationId,
      shotId: input.shotId,
    });

    const { error: uploadError } = await admin.storage.from(bucket).upload(objectPath, arrayBuffer, {
      contentType,
      upsert: true,
    });

    if (uploadError) {
      throw uploadError;
    }

    const metadataJson: Database["public"]["Tables"]["assets"]["Update"]["metadata_json"] = {
      ...asMetadataObject(input.metadataJson),
      provider_source_url: input.sourceUrl,
      storage_bucket: bucket,
      storage_object_path: objectPath,
      storage_sync_status: "synced",
      storage_synced_at: new Date().toISOString(),
    };

    const { error: updateError } = await admin
      .from("assets")
      .update({
        file_url: createStoragePointer(bucket, objectPath),
        metadata_json: metadataJson,
        mime_type: contentType ?? null,
      })
      .eq("id", input.assetId);

    if (updateError) {
      throw updateError;
    }

    return {
      mirrored: true,
      objectPath,
      reason: "uploaded",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message.slice(0, 240) : "Unknown storage sync error.";
    const metadataJson: Database["public"]["Tables"]["assets"]["Update"]["metadata_json"] = {
      ...asMetadataObject(input.metadataJson),
      provider_source_url: input.sourceUrl,
      storage_sync_error: message,
      storage_sync_status: "failed",
    };

    await admin
      .from("assets")
      .update({
        metadata_json: metadataJson,
      })
      .eq("id", input.assetId);

    return {
      mirrored: false,
      reason: message,
    };
  }
}
