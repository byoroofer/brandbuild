import "server-only";

import { createHmac } from "node:crypto";

import type { Json } from "@/types/database";

import { getProviderCatalogItem } from "@/lib/studio/providers/config";
import type {
  GenerationJob,
  GenerationJobStatus,
  GenerationProviderAdapter,
  GenerationRequest,
} from "@/lib/studio/providers/types";

const DEFAULT_KLING_API_BASE_URL = "https://api-singapore.klingai.com";
const DEFAULT_KLING_CREATE_PATH = "/v1/videos/text2video";
const DEFAULT_KLING_STATUS_PATH_TEMPLATE = "/v1/videos/text2video/{jobId}";
const DEFAULT_KLING_MODEL_NAME = "kling-v2-6";
const DEFAULT_KLING_MODE = "std";
const DEFAULT_KLING_SOUND_MODE = "off";
const DEFAULT_KLING_TOKEN_TTL_SECONDS = 1_800;

type KlingApiResponseEnvelope = {
  code?: number;
  data?: {
    created_at?: number;
    fail_reason?: string;
    result?: KlingResultPayload;
    task_id?: string;
    task_result?: KlingResultPayload;
    task_status?: string;
    updated_at?: number;
    [key: string]: Json | undefined;
  };
  message?: string;
  output?: {
    created_at?: number;
    fail_reason?: string;
    task_id?: string;
    task_result?: KlingResultPayload;
    task_status?: string;
    updated_at?: number;
    [key: string]: Json | undefined;
  };
  request_id?: string;
  [key: string]: Json | undefined;
};

type KlingVideoAsset = {
  cover_url?: string;
  download_url?: string;
  poster_url?: string;
  thumbnail_url?: string;
  url?: string;
};

type KlingResultPayload = {
  cover_url?: string;
  download_url?: string;
  poster_url?: string;
  thumbnail_url?: string;
  videos?: KlingVideoAsset[];
};

type KlingJobRecord = NonNullable<KlingApiResponseEnvelope["data"]> | NonNullable<KlingApiResponseEnvelope["output"]>;

function getKlingApiBaseUrl() {
  return (process.env.KLING_API_BASE_URL ?? DEFAULT_KLING_API_BASE_URL).trim().replace(/\/+$/, "");
}

function getKlingCreatePath() {
  return (process.env.KLING_API_CREATE_PATH ?? DEFAULT_KLING_CREATE_PATH).trim();
}

function getKlingStatusPathTemplate() {
  return (process.env.KLING_API_STATUS_PATH_TEMPLATE ?? DEFAULT_KLING_STATUS_PATH_TEMPLATE).trim();
}

function getKlingModelName() {
  const value = (process.env.KLING_API_MODEL_NAME ?? DEFAULT_KLING_MODEL_NAME).trim();
  return value.length > 0 ? value : DEFAULT_KLING_MODEL_NAME;
}

function getKlingMode() {
  const value = (process.env.KLING_API_MODE ?? DEFAULT_KLING_MODE).trim().toLowerCase();
  return value === "pro" ? "pro" : "std";
}

function getKlingSoundMode() {
  const value = (process.env.KLING_API_SOUND_MODE ?? DEFAULT_KLING_SOUND_MODE).trim().toLowerCase();
  return value === "on" ? "on" : "off";
}

function getKlingTokenTtlSeconds() {
  const parsed = Number(process.env.KLING_API_TOKEN_TTL_SECONDS ?? DEFAULT_KLING_TOKEN_TTL_SECONDS);

  if (Number.isFinite(parsed)) {
    return Math.max(60, Math.min(3_600, Math.trunc(parsed)));
  }

  return DEFAULT_KLING_TOKEN_TTL_SECONDS;
}

function getKlingCredentials() {
  const apiKey = process.env.KLING_API_KEY?.trim();
  const apiSecret = process.env.KLING_API_SECRET?.trim();

  if (!apiKey || !apiSecret) {
    return null;
  }

  return {
    apiKey,
    apiSecret,
  };
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signKlingJwt() {
  const credentials = getKlingCredentials();

  if (!credentials) {
    throw new Error("Kling is not configured. Set KLING_API_KEY and KLING_API_SECRET to enable live renders.");
  }

  const issuedAt = Math.floor(Date.now() / 1_000);
  const expiresAt = issuedAt + getKlingTokenTtlSeconds();
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const payload = {
    exp: expiresAt,
    iat: issuedAt,
    iss: credentials.apiKey,
    nbf: issuedAt - 5,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", credentials.apiSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  return `${encodedHeader}.${encodedPayload}.${base64UrlEncode(signature)}`;
}

function resolveKlingAspectRatio(aspectRatio: string) {
  switch (aspectRatio) {
    case "16:9":
    case "9:16":
    case "1:1":
      return aspectRatio;
    default:
      return "9:16";
  }
}

function resolveKlingDurationSeconds(durationSeconds: number) {
  if (durationSeconds <= 5) {
    return "5";
  }

  if (durationSeconds <= 10) {
    return "10";
  }

  return "15";
}

function normalizeKlingStatus(status: string | undefined): GenerationJobStatus {
  switch (status?.toLowerCase()) {
    case "submitted":
    case "pending":
    case "queued":
      return "queued";
    case "processing":
    case "running":
    case "in_progress":
      return "running";
    case "succeed":
    case "succeeded":
    case "success":
    case "completed":
    case "finished":
      return "succeeded";
    case "failed":
    case "error":
    case "cancelled":
      return "failed";
    default:
      return "queued";
  }
}

function extractKlingJobRecord(payload: KlingApiResponseEnvelope): KlingJobRecord {
  return payload.data ?? payload.output ?? {};
}

function asKlingResultPayload(value: unknown): KlingResultPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as KlingResultPayload;
}

function extractPrimaryVideoUrl(record: KlingJobRecord) {
  const resultPayload =
    asKlingResultPayload(record.task_result) ?? asKlingResultPayload(record.result);
  const video = resultPayload?.videos?.[0];

  if (typeof video?.url === "string") {
    return video.url;
  }

  if (typeof video?.download_url === "string") {
    return video.download_url;
  }

  if (typeof resultPayload?.download_url === "string") {
    return resultPayload.download_url;
  }

  return null;
}

function extractThumbnailUrl(record: KlingJobRecord) {
  const resultPayload =
    asKlingResultPayload(record.task_result) ?? asKlingResultPayload(record.result);
  const video = resultPayload?.videos?.[0];

  if (typeof video?.thumbnail_url === "string") {
    return video.thumbnail_url;
  }

  if (typeof video?.cover_url === "string") {
    return video.cover_url;
  }

  if (typeof video?.poster_url === "string") {
    return video.poster_url;
  }

  if (typeof resultPayload?.thumbnail_url === "string") {
    return resultPayload.thumbnail_url;
  }

  if (typeof resultPayload?.cover_url === "string") {
    return resultPayload.cover_url;
  }

  if (typeof resultPayload?.poster_url === "string") {
    return resultPayload.poster_url;
  }

  return null;
}

function extractFailureReason(payload: KlingApiResponseEnvelope, record: KlingJobRecord) {
  if (typeof record.fail_reason === "string" && record.fail_reason.trim().length > 0) {
    return record.fail_reason;
  }

  if (typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message;
  }

  return null;
}

function buildMockedJob(jobId: string, request?: GenerationRequest): GenerationJob {
  return {
    id: jobId,
    integrationMode: "mock",
    outputUrl: null,
    provider: "kling",
    raw: {
      message: "Kling integration stub ready for real API wiring.",
      plannedAspectRatio: request ? resolveKlingAspectRatio(request.aspectRatio) : undefined,
      plannedDurationSeconds: request ? Number(resolveKlingDurationSeconds(request.durationSeconds)) : undefined,
      readyForLiveWiring: true,
    },
    status: "mocked",
    thumbnailUrl: null,
  };
}

function buildKlingJob(
  payload: KlingApiResponseEnvelope,
  requestMeta: {
    requestedAspectRatio?: string;
    requestedDurationSeconds?: number;
    resolvedAspectRatio?: string;
    resolvedDurationSeconds?: string;
  },
): GenerationJob {
  const record = extractKlingJobRecord(payload);
  const taskId = typeof record.task_id === "string" ? record.task_id : undefined;

  if (!taskId) {
    throw new Error("Kling did not return a task id.");
  }

  const providerStatus = typeof record.task_status === "string" ? record.task_status : undefined;
  const failureReason = extractFailureReason(payload, record);

  return {
    id: taskId,
    integrationMode: "live",
    outputUrl: extractPrimaryVideoUrl(record),
    provider: "kling",
    raw: {
      failureReason: failureReason ?? undefined,
      klingMessage: payload.message,
      klingRequestId: payload.request_id,
      klingStatus: providerStatus,
      message:
        normalizeKlingStatus(providerStatus) === "failed"
          ? failureReason ?? "Kling reported a failed render."
          : "Kling accepted the render request.",
      model: getKlingModelName(),
      providerStatus,
      requestedAspectRatio: requestMeta.requestedAspectRatio,
      requestedDurationSeconds: requestMeta.requestedDurationSeconds,
      resolvedAspectRatio: requestMeta.resolvedAspectRatio,
      resolvedDurationSeconds: requestMeta.resolvedDurationSeconds,
      task: record as unknown as Record<string, Json | undefined>,
    },
    status: normalizeKlingStatus(providerStatus),
    thumbnailUrl: extractThumbnailUrl(record),
  };
}

function buildKlingApiUrl(pathname: string) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getKlingApiBaseUrl()}${normalizedPathname}`;
}

function buildKlingStatusPath(jobId: string) {
  return getKlingStatusPathTemplate().replace("{jobId}", jobId);
}

async function parseKlingJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Kling returned an invalid JSON response.");
  }
}

function extractKlingErrorMessage(status: number, payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string" &&
    payload.message.trim().length > 0
  ) {
    return payload.message;
  }

  return `Kling request failed with status ${status}.`;
}

function assertKlingSuccess(payload: KlingApiResponseEnvelope) {
  if (typeof payload.code === "number" && payload.code !== 0) {
    throw new Error(payload.message ?? `Kling request failed with code ${payload.code}.`);
  }
}

async function requestKling<T>(pathname: string, init: RequestInit) {
  const response = await fetch(buildKlingApiUrl(pathname), {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${signKlingJwt()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = await parseKlingJson<unknown>(response).catch(() => null);
    throw new Error(extractKlingErrorMessage(response.status, payload));
  }

  const payload = await parseKlingJson<KlingApiResponseEnvelope>(response);
  assertKlingSuccess(payload);
  return payload as T;
}

async function createKlingVideo(request: GenerationRequest) {
  const resolvedAspectRatio = resolveKlingAspectRatio(request.aspectRatio);
  const resolvedDurationSeconds = resolveKlingDurationSeconds(request.durationSeconds);
  const payload = await requestKling<KlingApiResponseEnvelope>(getKlingCreatePath(), {
    body: JSON.stringify({
      aspect_ratio: resolvedAspectRatio,
      duration: resolvedDurationSeconds,
      mode: getKlingMode(),
      model_name: getKlingModelName(),
      prompt: request.promptText,
      sound: getKlingSoundMode(),
    }),
    method: "POST",
  });

  return buildKlingJob(payload, {
    requestedAspectRatio: request.aspectRatio,
    requestedDurationSeconds: request.durationSeconds,
    resolvedAspectRatio,
    resolvedDurationSeconds,
  });
}

async function retrieveKlingVideo(jobId: string) {
  const payload = await requestKling<KlingApiResponseEnvelope>(buildKlingStatusPath(jobId), {
    method: "GET",
  });

  return buildKlingJob(payload, {});
}

export const klingProvider: GenerationProviderAdapter = {
  capabilities: ["controlled-motion", "character-performance", "lip-sync-friendly"],
  description: getProviderCatalogItem("kling").description,
  id: "kling",
  label: "Kling",
  async enqueue(request: GenerationRequest) {
    if (!getKlingCredentials()) {
      return buildMockedJob(`mock-kling-${request.shotId}`, request);
    }

    return createKlingVideo(request);
  },
  async getJob(jobId: string) {
    if (!getKlingCredentials() || jobId.startsWith("mock-kling-")) {
      return buildMockedJob(jobId);
    }

    return retrieveKlingVideo(jobId);
  },
  isConfigured() {
    return getProviderCatalogItem("kling").configured;
  },
};
