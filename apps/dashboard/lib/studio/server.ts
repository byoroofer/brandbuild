import { randomUUID } from "node:crypto";

import type { User } from "@supabase/supabase-js";

import { createAdminSupabaseClient, isSupabaseAdminAvailable } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  maxStudioImageUploadBytes,
  maxStudioVideoUploadBytes,
  studioImageUploadMimeTypes,
  studioVideoUploadMimeTypes,
  uploadableStudioAssetTypes,
} from "@/lib/studio/validation";
import { buildPrivateAssetPath } from "@/lib/utils/storage";

export class StudioApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "StudioApiError";
  }
}

export type StudioUploadAssetType = (typeof uploadableStudioAssetTypes)[number];

export type StudioRequestContext = {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  user: User;
};

function getUploadKind(assetType: StudioUploadAssetType) {
  return assetType === "reference_video" ? "video" : "image";
}

export function assertStudioSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  if (origin !== new URL(getAppUrl()).origin) {
    throw new StudioApiError("Cross-site requests are not allowed.", 403);
  }
}

export async function requireStudioRequestContext(): Promise<StudioRequestContext> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new StudioApiError("Authentication required.", 401);
  }

  return {
    supabase,
    user,
  };
}

export function makeSafeStudioStoragePath(
  campaignId: string,
  shotId: string,
  fileName: string,
) {
  const extension = fileName.toLowerCase().split(".").pop() ?? "bin";
  const safeBase = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return buildPrivateAssetPath(
    campaignId,
    `uploads/${safeBase || "upload"}-${randomUUID()}.${extension}`,
    shotId,
  );
}

export function validateStudioAssetUpload(file: File, assetType: StudioUploadAssetType) {
  const uploadKind = getUploadKind(assetType);

  if (
    uploadKind === "video" &&
    !studioVideoUploadMimeTypes.includes(
      file.type as (typeof studioVideoUploadMimeTypes)[number],
    )
  ) {
    throw new StudioApiError("Upload an MP4, MOV, or WebM reference video.", 400);
  }

  if (
    uploadKind === "image" &&
    !studioImageUploadMimeTypes.includes(
      file.type as (typeof studioImageUploadMimeTypes)[number],
    )
  ) {
    throw new StudioApiError("Upload a JPG, PNG, or WebP image.", 400);
  }

  const maxBytes =
    uploadKind === "video" ? maxStudioVideoUploadBytes : maxStudioImageUploadBytes;

  if (file.size > maxBytes) {
    throw new StudioApiError(
      uploadKind === "video"
        ? "Reference videos must be 20 MB or smaller in this first upload workflow."
        : "Images must be 10 MB or smaller.",
      400,
    );
  }
}

export async function resolveStudioPrivateObjectUrl(
  path: string | null,
  supabase?: StudioRequestContext["supabase"],
) {
  if (!path) {
    return null;
  }

  const bucketName = process.env.STORAGE_BUCKET_ASSETS || "assets";
  const signedUrlClient = supabase ?? (isSupabaseAdminAvailable() ? createAdminSupabaseClient() : null);

  if (!signedUrlClient) {
    return null;
  }

  const signedUrlResult = await signedUrlClient.storage
    .from(bucketName)
    .createSignedUrl(path, 60 * 30);

  if (signedUrlResult.error || !signedUrlResult.data?.signedUrl) {
    return null;
  }

  return signedUrlResult.data.signedUrl;
}
