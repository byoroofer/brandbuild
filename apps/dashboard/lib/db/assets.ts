import type { Database } from "@/types/database";

import type {
  StudioRequestContext,
  StudioUploadAssetType,
} from "@/lib/studio/server";
import {
  makeSafeStudioStoragePath,
  resolveStudioPrivateObjectUrl,
  StudioApiError,
} from "@/lib/studio/server";
import { listAssets as listWorkspaceAssets } from "@/lib/studio/repository";
import { createStoragePointer } from "@/lib/utils/storage";

type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"];
type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

function inferUploadTags(assetType: StudioUploadAssetType) {
  const tags = ["uploaded", "studio"];

  if (assetType === "reference_video") {
    tags.push("reference", "video");
  } else {
    tags.push("reference", "image");
  }

  return tags;
}

function inferLinkedTags(
  assetType: Database["public"]["Tables"]["assets"]["Row"]["type"],
  extraTags: string[] = [],
) {
  const tags = ["linked", "studio", ...extraTags];

  if (assetType === "reference_video") {
    tags.push("reference", "video");
  } else {
    tags.push("reference", "image");
  }

  return Array.from(new Set(tags));
}

function inferLinkedMimeType(
  assetType: Database["public"]["Tables"]["assets"]["Row"]["type"],
  fileUrl: string,
) {
  const lowerUrl = fileUrl.toLowerCase();

  if (assetType === "reference_video") {
    if (lowerUrl.endsWith(".webm")) {
      return "video/webm";
    }

    if (lowerUrl.endsWith(".mov")) {
      return "video/quicktime";
    }

    return "video/mp4";
  }

  if (lowerUrl.endsWith(".png")) {
    return "image/png";
  }

  if (lowerUrl.endsWith(".webp")) {
    return "image/webp";
  }

  if (lowerUrl.endsWith(".svg")) {
    return "image/svg+xml";
  }

  return "image/jpeg";
}

export async function createUploadedShotAsset(
  context: StudioRequestContext,
  input: {
    assetType: StudioUploadAssetType;
    campaignId: string;
    file: File;
    shotId: string;
    shotTitle: string;
  },
) {
  const objectPath = makeSafeStudioStoragePath(input.campaignId, input.shotId, input.file.name);
  const bucketName = process.env.STORAGE_BUCKET_ASSETS || "assets";
  const fileBuffer = Buffer.from(await input.file.arrayBuffer());
  const uploadResult = await context.supabase.storage.from(bucketName).upload(objectPath, fileBuffer, {
    cacheControl: "3600",
    contentType: input.file.type,
    upsert: true,
  });

  if (uploadResult.error) {
    throw new StudioApiError(
      uploadResult.error.message || "We couldn't upload that file to private storage.",
      500,
    );
  }

  const insertPayload: AssetInsert = {
    campaign_id: input.campaignId,
    file_name: input.file.name,
    file_size_bytes: input.file.size,
    file_url: createStoragePointer(bucketName, objectPath),
    metadata_json: {
      asset_role: input.assetType,
      original_file_name: input.file.name,
      shot_title: input.shotTitle,
      storage_bucket: bucketName,
      storage_object_path: objectPath,
      uploaded_by_user_id: context.user.id,
    },
    mime_type: input.file.type || null,
    shot_id: input.shotId,
    source: "upload",
    tags: inferUploadTags(input.assetType),
    type: input.assetType,
  };

  const { data: assetRow, error: assetInsertError } = await (context.supabase
    .from("assets") as any)
    .insert(insertPayload)
    .select("*")
    .single();

  if (assetInsertError || !assetRow) {
    await context.supabase.storage.from(bucketName).remove([objectPath]);
    throw new StudioApiError(
      assetInsertError?.message ?? "We couldn't create the asset record.",
      500,
    );
  }

  const signedUrl = await resolveStudioPrivateObjectUrl(objectPath, context.supabase);

  return {
    asset: {
      ...(assetRow as AssetRow),
      file_url: signedUrl ?? (assetRow as AssetRow).file_url,
    },
    objectPath,
  };
}

export async function createLinkedShotAsset(
  context: StudioRequestContext,
  input: {
    assetType: Database["public"]["Tables"]["assets"]["Row"]["type"];
    campaignId: string;
    fileName: string;
    fileUrl: string;
    metadataJson?: Record<string, string | number | boolean | null>;
    shotId: string;
    shotTitle: string;
    tags?: string[];
  },
) {
  const insertPayload: AssetInsert = {
    campaign_id: input.campaignId,
    file_name: input.fileName,
    file_url: input.fileUrl,
    metadata_json: {
      asset_role: input.assetType,
      linked_by_user_id: context.user.id,
      linked_url: input.fileUrl,
      shot_title: input.shotTitle,
      ...(input.metadataJson ?? {}),
    },
    mime_type: inferLinkedMimeType(input.assetType, input.fileUrl),
    shot_id: input.shotId,
    source: "external_link",
    tags: inferLinkedTags(input.assetType, input.tags),
    type: input.assetType,
  };

  const { data: assetRow, error: assetInsertError } = await (context.supabase
    .from("assets") as any)
    .insert(insertPayload)
    .select("*")
    .single();

  if (assetInsertError || !assetRow) {
    throw new StudioApiError(
      assetInsertError?.message ?? "We couldn't create the linked asset record.",
      500,
    );
  }

  return {
    asset: assetRow as AssetRow,
  };
}

export async function listAssets() {
  return listWorkspaceAssets();
}
