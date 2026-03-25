import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createLinkedShotAsset, createUploadedShotAsset } from "@/lib/db/assets";
import { getAppUrl } from "@/lib/supabase/env";
import {
  getStudioReferenceSample,
  resolveStudioReferenceSampleUrl,
} from "@/lib/studio/reference-samples";
import {
  assertStudioSameOrigin,
  requireStudioRequestContext,
  type StudioUploadAssetType,
  StudioApiError,
  validateStudioAssetUpload,
} from "@/lib/studio/server";
import {
  studioAssetUploadSchema,
  studioExternalAssetSchema,
  studioReferenceSampleImportSchema,
} from "@/lib/studio/validation";
import type { Database } from "@/types/database";

type ShotAssetUploadRouteProps = {
  params: Promise<{
    shotId: string;
  }>;
};

type ShotLookupRow = Pick<Database["public"]["Tables"]["shots"]["Row"], "campaign_id" | "id" | "title">;

function deriveLinkedFileName(fileUrl: string, fallback: string) {
  try {
    const url = new URL(fileUrl);
    const segment = url.pathname.split("/").filter(Boolean).pop();

    if (segment && segment.length > 0) {
      return decodeURIComponent(segment);
    }
  } catch {
    // Fall back to the safe default below.
  }

  return fallback;
}

async function requireShot(
  context: Awaited<ReturnType<typeof requireStudioRequestContext>>,
  shotId: string,
) {
  const { data: shotData, error: shotError } = await (context.supabase
    .from("shots") as any)
    .select("campaign_id, id, title")
    .eq("id", shotId)
    .single();
  const shot = (shotData ?? null) as ShotLookupRow | null;

  if (shotError || !shot) {
    throw new StudioApiError("We couldn't find that shot.", 404);
  }

  return shot;
}

export async function POST(request: Request, { params }: ShotAssetUploadRouteProps) {
  try {
    assertStudioSameOrigin(request);
    const context = await requireStudioRequestContext();
    const { shotId } = await params;
    const shot = await requireShot(context, shotId);
    const contentType = request.headers.get("content-type") ?? "";
    let asset:
      | Awaited<ReturnType<typeof createUploadedShotAsset>>["asset"]
      | Awaited<ReturnType<typeof createLinkedShotAsset>>["asset"];
    let activityAction = "shot_asset_uploaded";
    let activityPayload: Record<string, string | null> = {
      linked_by_user_id: null,
      sample_id: null,
      source_mode: "upload",
      uploaded_by_user_id: context.user.id,
    };

    if (contentType.includes("application/json")) {
      const body = (await request.json().catch(() => null)) as
        | {
            assetType?: string;
            fileName?: string;
            fileUrl?: string;
            mode?: string;
            sampleId?: string;
          }
        | null;

      if (!body?.mode) {
        throw new StudioApiError("Choose a valid import mode.", 400);
      }

      if (body.mode === "sample_reference") {
        const parsed = studioReferenceSampleImportSchema.safeParse({
          sampleId: body.sampleId,
        });

        if (!parsed.success) {
          throw new StudioApiError(
            parsed.error.issues[0]?.message ?? "Choose a reference sample.",
            400,
          );
        }

        const sample = getStudioReferenceSample(parsed.data.sampleId);

        if (!sample) {
          throw new StudioApiError("We couldn't find that reference sample.", 404);
        }

        const { asset: linkedAsset } = await createLinkedShotAsset(context, {
          assetType: sample.assetType,
          campaignId: shot.campaign_id,
          fileName: sample.fileName,
          fileUrl: resolveStudioReferenceSampleUrl(sample, getAppUrl()),
          metadataJson: {
            import_mode: "sample_reference",
            provider_fit: sample.targetModels.join(", "),
            sample_id: sample.id,
            sample_title: sample.title,
            source_label: sample.sourceLabel,
          },
          shotId: shot.id,
          shotTitle: shot.title,
          tags: sample.tags,
        });

        asset = linkedAsset;
        activityAction = "shot_asset_sample_imported";
        activityPayload = {
          linked_by_user_id: context.user.id,
          sample_id: sample.id,
          source_mode: "sample_reference",
          uploaded_by_user_id: null,
        };
      } else if (body.mode === "external_url") {
        const parsed = studioExternalAssetSchema.safeParse({
          assetType: body.assetType,
          fileName: body.fileName,
          fileUrl: body.fileUrl,
        });

        if (!parsed.success) {
          throw new StudioApiError(
            parsed.error.issues[0]?.message ?? "Paste a valid hosted media URL.",
            400,
          );
        }

        const { asset: linkedAsset } = await createLinkedShotAsset(context, {
          assetType: parsed.data.assetType,
          campaignId: shot.campaign_id,
          fileName:
            parsed.data.fileName ??
            deriveLinkedFileName(
              parsed.data.fileUrl,
              `${parsed.data.assetType.replaceAll("_", "-")}.asset`,
            ),
          fileUrl: parsed.data.fileUrl,
          metadataJson: {
            import_mode: "external_url",
            source_label: "Operator-hosted media URL",
          },
          shotId: shot.id,
          shotTitle: shot.title,
          tags: ["external-url"],
        });

        asset = linkedAsset;
        activityAction = "shot_asset_linked";
        activityPayload = {
          linked_by_user_id: context.user.id,
          sample_id: null,
          source_mode: "external_url",
          uploaded_by_user_id: null,
        };
      } else {
        throw new StudioApiError("Choose a valid import mode.", 400);
      }
    } else {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        throw new StudioApiError("Choose a file to upload.", 400);
      }

      const parsed = studioAssetUploadSchema.safeParse({
        assetType: formData.get("assetType"),
      });

      if (!parsed.success) {
        throw new StudioApiError(
          parsed.error.issues[0]?.message ?? "Choose a valid asset type.",
          400,
        );
      }

      validateStudioAssetUpload(file, parsed.data.assetType as StudioUploadAssetType);

      const result = await createUploadedShotAsset(context, {
        assetType: parsed.data.assetType,
        campaignId: shot.campaign_id,
        file,
        shotId: shot.id,
        shotTitle: shot.title,
      });

      asset = result.asset;
    }

    await (context.supabase.from("activity_log") as any).insert({
      action: activityAction,
      entity_id: asset.id,
      entity_type: "asset",
      payload: {
        asset_type: asset.type,
        campaign_id: shot.campaign_id,
        file_name: asset.file_name,
        linked_by_user_id: activityPayload.linked_by_user_id,
        sample_id: activityPayload.sample_id,
        shot_id: shot.id,
        source_mode: activityPayload.source_mode,
        uploaded_by_user_id: activityPayload.uploaded_by_user_id,
      },
    });

    revalidatePath("/dashboard/assets");
    revalidatePath(`/dashboard/campaigns/${shot.campaign_id}`);
    revalidatePath(`/dashboard/shots/${shot.id}`);

    return NextResponse.json({
      asset: {
        createdAt: asset.created_at,
        fileName: asset.file_name,
        fileUrl: asset.file_url,
        id: asset.id,
        mimeType: asset.mime_type,
        type: asset.type,
      },
      success: true,
    });
  } catch (error) {
    if (error instanceof StudioApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Something went wrong while processing this upload." },
      { status: 500 },
    );
  }
}
