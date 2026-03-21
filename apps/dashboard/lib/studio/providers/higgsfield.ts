import "server-only";

import type { Json } from "@/types/database";

import { getProviderCatalogItem } from "@/lib/studio/providers/config";
import type {
  GenerationJob,
  GenerationJobStatus,
  GenerationProviderAdapter,
  GenerationRequest,
} from "@/lib/studio/providers/types";

const DEFAULT_HIGGSFIELD_API_BASE_URL = "https://platform.higgsfield.ai";
const DEFAULT_HIGGSFIELD_MODEL_ID = "higgsfield-ai/dop/standard";
const DEFAULT_HIGGSFIELD_RESOLUTION = "720p";
const DEFAULT_HIGGSFIELD_DURATION_SECONDS = 5;

type HiggsfieldMediaAsset = {
  url?: string;
  [key: string]: Json | undefined;
};

type HiggsfieldApiResponse = {
  cancel_url?: string;
  detail?: string;
  error?: string;
  images?: HiggsfieldMediaAsset[];
  message?: string;
  request_id?: string;
  status?: string;
  status_url?: string;
  video?: HiggsfieldMediaAsset | null;
  [key: string]: Json | undefined;
};

function getHiggsfieldApiBaseUrl() {
  return (process.env.HIGGSFIELD_API_BASE_URL ?? DEFAULT_HIGGSFIELD_API_BASE_URL)
    .trim()
    .replace(/\/+$/, "");
}

function getHiggsfieldModelId() {
  const value = (process.env.HIGGSFIELD_MODEL_ID ?? DEFAULT_HIGGSFIELD_MODEL_ID).trim();
  return value.length > 0 ? value.replace(/^\/+|\/+$/g, "") : DEFAULT_HIGGSFIELD_MODEL_ID;
}

function getHiggsfieldResolution() {
  const value = (process.env.HIGGSFIELD_RESOLUTION ?? DEFAULT_HIGGSFIELD_RESOLUTION).trim();
  return value.length > 0 ? value : DEFAULT_HIGGSFIELD_RESOLUTION;
}

function getHiggsfieldDurationSeconds() {
  const parsed = Number(
    process.env.HIGGSFIELD_DURATION_SECONDS ?? DEFAULT_HIGGSFIELD_DURATION_SECONDS,
  );

  if (Number.isFinite(parsed)) {
    return Math.max(1, Math.min(10, Math.trunc(parsed)));
  }

  return DEFAULT_HIGGSFIELD_DURATION_SECONDS;
}

function getHiggsfieldWebhookUrl() {
  const value = process.env.HIGGSFIELD_WEBHOOK_URL?.trim();
  return value && value.length > 0 ? value : null;
}

function getHiggsfieldCredentialPair() {
  const combined =
    process.env.HF_KEY?.trim() ??
    process.env.HIGGSFIELD_KEY?.trim() ??
    (process.env.HIGGSFIELD_API_KEY?.includes(":")
      ? process.env.HIGGSFIELD_API_KEY.trim()
      : null);

  if (combined) {
    const separatorIndex = combined.indexOf(":");

    if (separatorIndex > 0) {
      return {
        apiKey: combined.slice(0, separatorIndex),
        apiSecret: combined.slice(separatorIndex + 1),
      };
    }
  }

  const apiKey =
    process.env.HIGGSFIELD_API_KEY?.trim() ?? process.env.HF_API_KEY?.trim() ?? null;
  const apiSecret =
    process.env.HIGGSFIELD_API_SECRET?.trim() ?? process.env.HF_API_SECRET?.trim() ?? null;

  if (!apiKey || !apiSecret) {
    return null;
  }

  return {
    apiKey,
    apiSecret,
  };
}

function normalizeHiggsfieldStatus(status: string | undefined): GenerationJobStatus {
  switch (status?.toLowerCase()) {
    case "queued":
    case "pending":
    case "submitted":
      return "queued";
    case "processing":
    case "running":
    case "in_progress":
      return "running";
    case "completed":
    case "succeeded":
    case "success":
      return "succeeded";
    case "failed":
    case "error":
    case "cancelled":
    case "canceled":
    case "nsfw":
    case "rejected":
      return "failed";
    default:
      return "queued";
  }
}

function resolveHiggsfieldAspectRatio(aspectRatio: string) {
  switch (aspectRatio) {
    case "16:9":
    case "9:16":
    case "1:1":
      return aspectRatio;
    default:
      return "16:9";
  }
}

function resolveRequestedDurationSeconds(durationSeconds: number) {
  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return Math.max(1, Math.min(10, Math.round(durationSeconds)));
  }

  return DEFAULT_HIGGSFIELD_DURATION_SECONDS;
}

function looksLikeImageUrl(url: string) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp"].some((extension) =>
      pathname.endsWith(extension),
    );
  } catch {
    return false;
  }
}

function pickReferenceImageUrl(referenceAssetUrls: string[]) {
  return referenceAssetUrls.find(looksLikeImageUrl) ?? null;
}

function isImageToVideoModel(modelId: string) {
  return /\/dop\//i.test(modelId) || /image-to-video/i.test(modelId);
}

function extractJobId(payload: HiggsfieldApiResponse) {
  if (typeof payload.request_id === "string" && payload.request_id.trim().length > 0) {
    return payload.request_id;
  }

  if (typeof payload.status_url === "string" && payload.status_url.trim().length > 0) {
    const match = payload.status_url.match(/\/requests\/([^/]+)\/status/i);
    return match?.[1] ?? null;
  }

  return null;
}

function extractVideoUrl(payload: HiggsfieldApiResponse) {
  return typeof payload.video?.url === "string" ? payload.video.url : null;
}

function extractThumbnailUrl(payload: HiggsfieldApiResponse) {
  return typeof payload.images?.[0]?.url === "string" ? payload.images[0].url : null;
}

function extractFailureReason(payload: HiggsfieldApiResponse) {
  if (typeof payload.error === "string" && payload.error.trim().length > 0) {
    return payload.error;
  }

  if (typeof payload.detail === "string" && payload.detail.trim().length > 0) {
    return payload.detail;
  }

  if (typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message;
  }

  return null;
}

function buildHiggsfieldApiUrl(pathname: string, query?: Record<string, string>) {
  const normalizedPathname = pathname.replace(/^\/+/, "");
  const url = new URL(`${getHiggsfieldApiBaseUrl()}/${normalizedPathname}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value.trim().length > 0) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

async function parseHiggsfieldJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Higgsfield returned an invalid JSON response.");
  }
}

function extractHiggsfieldErrorMessage(status: number, payload: unknown) {
  if (payload && typeof payload === "object") {
    if ("error" in payload && typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }

    if (
      "detail" in payload &&
      typeof payload.detail === "string" &&
      payload.detail.trim().length > 0
    ) {
      return payload.detail;
    }

    if (
      "message" in payload &&
      typeof payload.message === "string" &&
      payload.message.trim().length > 0
    ) {
      return payload.message;
    }
  }

  return `Higgsfield request failed with status ${status}.`;
}

async function requestHiggsfield<T>(
  pathname: string,
  init: RequestInit,
  query?: Record<string, string>,
) {
  const credentials = getHiggsfieldCredentialPair();

  if (!credentials) {
    throw new Error(
      "Higgsfield is not configured. Create a Higgsfield Cloud account and add HIGGSFIELD_API_KEY plus HIGGSFIELD_API_SECRET.",
    );
  }

  const response = await fetch(buildHiggsfieldApiUrl(pathname, query), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Key ${credentials.apiKey}:${credentials.apiSecret}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = await parseHiggsfieldJson<unknown>(response).catch(() => null);
    throw new Error(extractHiggsfieldErrorMessage(response.status, payload));
  }

  return parseHiggsfieldJson<T>(response);
}

function buildMockedJob(jobId: string, request?: GenerationRequest): GenerationJob {
  return {
    id: jobId,
    integrationMode: "mock",
    outputUrl: null,
    provider: "higgsfield",
    raw: {
      plannedAspectRatio: request ? resolveHiggsfieldAspectRatio(request.aspectRatio) : undefined,
      plannedDurationSeconds: request
        ? resolveRequestedDurationSeconds(request.durationSeconds)
        : undefined,
      plannedModel: getHiggsfieldModelId(),
      message: "Higgsfield integration stub ready for real API wiring.",
      readyForLiveWiring: true,
    },
    status: "mocked",
    thumbnailUrl: null,
  };
}

function buildHiggsfieldJob(
  payload: HiggsfieldApiResponse,
  requestMeta: {
    referenceImageUrl?: string | null;
    requestedAspectRatio?: string;
    requestedDurationSeconds?: number;
  } = {},
): GenerationJob {
  const jobId = extractJobId(payload);

  if (!jobId) {
    throw new Error("Higgsfield did not return a request id.");
  }

  const providerStatus = typeof payload.status === "string" ? payload.status : undefined;
  const failureReason = extractFailureReason(payload);

  return {
    id: jobId,
    integrationMode: "live",
    outputUrl: extractVideoUrl(payload),
    provider: "higgsfield",
    raw: {
      cancelUrl: payload.cancel_url,
      failureReason: failureReason ?? undefined,
      message:
        normalizeHiggsfieldStatus(providerStatus) === "failed"
          ? failureReason ?? "Higgsfield reported a failed render."
          : "Higgsfield accepted the render request.",
      model: getHiggsfieldModelId(),
      providerStatus,
      referenceImageUrl: requestMeta.referenceImageUrl ?? undefined,
      requestedAspectRatio: requestMeta.requestedAspectRatio,
      requestedDurationSeconds: requestMeta.requestedDurationSeconds,
      response: payload as unknown as Record<string, Json | undefined>,
      statusUrl: payload.status_url,
    },
    status: normalizeHiggsfieldStatus(providerStatus),
    thumbnailUrl: extractThumbnailUrl(payload),
  };
}

async function createHiggsfieldGeneration(request: GenerationRequest) {
  const modelId = getHiggsfieldModelId();
  const referenceImageUrl = pickReferenceImageUrl(request.referenceAssetUrls);
  const requestedDurationSeconds = resolveRequestedDurationSeconds(request.durationSeconds);
  const requestedAspectRatio = resolveHiggsfieldAspectRatio(request.aspectRatio);

  if (isImageToVideoModel(modelId) && !referenceImageUrl) {
    throw new Error(
      "Higgsfield is currently configured with an image-to-video model. Attach a reference image to this shot or change HIGGSFIELD_MODEL_ID to a prompt-first model.",
    );
  }

  const payload: Record<string, string | number> = {
    duration: getHiggsfieldDurationSeconds(),
    prompt: request.promptText,
  };

  if (referenceImageUrl) {
    payload.image_url = referenceImageUrl;
  } else {
    payload.aspect_ratio = requestedAspectRatio;
    payload.resolution = getHiggsfieldResolution();
  }

  const webhookUrl = getHiggsfieldWebhookUrl();
  const response = await requestHiggsfield<HiggsfieldApiResponse>(
    modelId,
    {
      body: JSON.stringify(payload),
      method: "POST",
    },
    webhookUrl ? { hf_webhook: webhookUrl } : undefined,
  );

  return buildHiggsfieldJob(response, {
    referenceImageUrl,
    requestedAspectRatio,
    requestedDurationSeconds,
  });
}

async function retrieveHiggsfieldGeneration(jobId: string) {
  const payload = await requestHiggsfield<HiggsfieldApiResponse>(`requests/${jobId}/status`, {
    method: "GET",
  });

  return buildHiggsfieldJob(payload);
}

export const higgsfieldProvider: GenerationProviderAdapter = {
  capabilities: ["experimental-worldbuilding", "premium-cinematic"],
  description: getProviderCatalogItem("higgsfield").description,
  id: "higgsfield",
  label: "Higgsfield",
  async enqueue(request) {
    if (!getHiggsfieldCredentialPair()) {
      return buildMockedJob(`mock-higgsfield-${request.shotId}`, request);
    }

    return createHiggsfieldGeneration(request);
  },
  async getJob(jobId: string) {
    if (!getHiggsfieldCredentialPair() || jobId.startsWith("mock-higgsfield-")) {
      return buildMockedJob(jobId);
    }

    return retrieveHiggsfieldGeneration(jobId);
  },
  isConfigured() {
    return getProviderCatalogItem("higgsfield").configured;
  },
};
