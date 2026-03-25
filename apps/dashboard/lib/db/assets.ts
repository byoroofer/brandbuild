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

export async function listAssets() {
  return listWorkspaceAssets();
}
