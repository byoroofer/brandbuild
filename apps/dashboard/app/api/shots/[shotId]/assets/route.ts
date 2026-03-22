import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createUploadedShotAsset } from "@/lib/db/assets";
import {
  assertStudioSameOrigin,
  requireStudioRequestContext,
  type StudioUploadAssetType,
  StudioApiError,
  validateStudioAssetUpload,
} from "@/lib/studio/server";
import { studioAssetUploadSchema } from "@/lib/studio/validation";
import type { Database } from "@/types/database";

type ShotAssetUploadRouteProps = {
  params: Promise<{
    shotId: string;
  }>;
};

type ShotLookupRow = Pick<Database["public"]["Tables"]["shots"]["Row"], "campaign_id" | "id" | "title">;

export async function POST(request: Request, { params }: ShotAssetUploadRouteProps) {
  try {
    assertStudioSameOrigin(request);
    const context = await requireStudioRequestContext();
    const { shotId } = await params;
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

    const { data: shotData, error: shotError } = await (context.supabase
      .from("shots") as any)
      .select("campaign_id, id, title")
      .eq("id", shotId)
      .single();
    const shot = (shotData ?? null) as ShotLookupRow | null;

    if (shotError || !shot) {
      throw new StudioApiError("We couldn't find that shot.", 404);
    }

    const { asset } = await createUploadedShotAsset(context, {
      assetType: parsed.data.assetType,
      campaignId: shot.campaign_id,
      file,
      shotId: shot.id,
      shotTitle: shot.title,
    });

    await (context.supabase.from("activity_log") as any).insert({
      action: "shot_asset_uploaded",
      entity_id: asset.id,
      entity_type: "asset",
      payload: {
        asset_type: asset.type,
        campaign_id: shot.campaign_id,
        file_name: asset.file_name,
        shot_id: shot.id,
        uploaded_by_user_id: context.user.id,
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
