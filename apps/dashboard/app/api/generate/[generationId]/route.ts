import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { refreshShotGenerationStatus } from "@/lib/db/shot-generations";
import { resolveGenerationOutputPath } from "@/lib/studio/generation-content";

type RefreshGenerationRouteProps = {
  params: Promise<{ generationId: string }>;
};

export async function POST(
  _request: Request,
  { params }: RefreshGenerationRouteProps,
) {
  const { generationId } = await params;

  try {
    const result = await refreshShotGenerationStatus(generationId);

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/shots/${result.shotId}`);
    revalidatePath("/dashboard/shots");
    revalidatePath("/dashboard/assets");

    return NextResponse.json({
      generationId: result.generation.id,
      integrationMode: result.job.integrationMode,
      progress:
        typeof result.job.raw?.progress === "number" ? result.job.raw.progress : null,
      outputUrl: resolveGenerationOutputPath({
        generationId: result.generation.id,
        integrationMode: result.job.integrationMode,
        outputUrl: typeof result.job.outputUrl === "string" ? result.job.outputUrl : null,
        provider: result.job.provider,
        providerJobId: result.job.id,
        status: result.job.status,
      }),
      provider: result.job.provider,
      providerStatus:
        typeof result.job.raw?.providerStatus === "string"
          ? result.job.raw.providerStatus
          : typeof result.job.raw?.klingStatus === "string"
            ? result.job.raw.klingStatus
            : typeof result.job.raw?.openaiStatus === "string"
              ? result.job.raw.openaiStatus
              : result.job.status,
      status: result.job.status,
      success: true,
      syncedAssetsCount: result.syncedAssetsCount,
      thumbnailUrl:
        typeof result.job.thumbnailUrl === "string" ? result.job.thumbnailUrl : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to refresh generation status.",
      },
      { status: 500 },
    );
  }
}
