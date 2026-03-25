import { NextResponse } from "next/server";

import { createStudioReadClient } from "@/lib/db/client";
import { getProvider } from "@/lib/providers/router";

type GenerationContentRouteProps = {
  params: Promise<{ generationId: string }>;
};

function buildErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  _request: Request,
  { params }: GenerationContentRouteProps,
) {
  const supabase = await createStudioReadClient();

  if (!supabase) {
    return buildErrorResponse("Sign in to access generated media.", 401);
  }

  const { generationId } = await params;
  const { data: generation, error } = await supabase
    .from("shot_generations")
    .select("id, provider, provider_job_id, status")
    .eq("id", generationId)
    .single();

  if (error || !generation) {
    return buildErrorResponse("Generation not found.", 404);
  }

  if (!generation.provider_job_id) {
    return buildErrorResponse("This generation does not have provider media to retrieve yet.", 409);
  }

  const provider = getProvider(generation.provider);

  if (typeof provider.getContent !== "function") {
    return buildErrorResponse("This provider does not expose direct media retrieval here yet.", 501);
  }

  try {
    const providerResponse = await provider.getContent(generation.provider_job_id);
    const headers = new Headers();
    const contentType = providerResponse.headers.get("content-type");
    const contentDisposition = providerResponse.headers.get("content-disposition");
    const contentLength = providerResponse.headers.get("content-length");

    if (contentType) {
      headers.set("content-type", contentType);
    }

    if (contentDisposition) {
      headers.set("content-disposition", contentDisposition);
    }

    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    headers.set("cache-control", "private, no-store, max-age=0");

    return new NextResponse(providerResponse.body, {
      headers,
      status: 200,
    });
  } catch (providerError) {
    return buildErrorResponse(
      providerError instanceof Error
        ? providerError.message
        : "Unable to retrieve provider media.",
      502,
    );
  }
}
