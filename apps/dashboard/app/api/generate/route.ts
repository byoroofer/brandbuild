import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { triggerShotGeneration } from "@/lib/db/shot-generations";
import { resolveGenerationOutputPath } from "@/lib/studio/generation-content";
import { promptBuilderSchema } from "@/lib/studio/validation";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON payload.",
      },
      { status: 400 },
    );
  }

  const parsed = promptBuilderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid generation payload.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await triggerShotGeneration(parsed.data);

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/shots/${parsed.data.shotId}`);
    revalidatePath("/dashboard/shots");
    revalidatePath("/dashboard/assets");

    return NextResponse.json({
      generationId: result.generation.id,
      integrationMode: result.job.integrationMode,
      jobId: result.job.id,
      outputUrl: resolveGenerationOutputPath({
        generationId: result.generation.id,
        integrationMode: result.job.integrationMode,
        outputUrl: typeof result.job.outputUrl === "string" ? result.job.outputUrl : null,
        provider: result.job.provider,
        providerJobId: result.job.id,
        status: result.job.status,
      }),
      provider: result.job.provider,
      status: result.job.status,
      success: true,
      syncedAssetsCount: result.syncedAssetsCount,
      thumbnailUrl:
        typeof result.job.thumbnailUrl === "string" ? result.job.thumbnailUrl : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to trigger generation.",
      },
      { status: 500 },
    );
  }
}
