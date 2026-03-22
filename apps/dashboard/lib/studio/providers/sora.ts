import "server-only";

import type { Json } from "@/types/database";

import { getProviderCatalogItem } from "@/lib/studio/providers/config";
import type {
  GenerationJob,
  GenerationJobStatus,
  GenerationProviderAdapter,
  GenerationRequest,
} from "@/lib/studio/providers/types";

const OPENAI_API_BASE_URL = "https://api.openai.com/v1";
const FALLBACK_SORA_MODEL = "sora-2";
const SUPPORTED_SORA_MODELS = ["sora-2", "sora-2-pro"] as const;

type SupportedSoraModel = (typeof SUPPORTED_SORA_MODELS)[number];

type OpenAiSoraVideoResponse = {
  created_at?: number;
  id?: string;
  model?: string;
  poster_frame_url?: string;
  progress?: number;
  seconds?: string;
  size?: string;
  status?: string;
  url?: string;
  [key: string]: Json | undefined;
};

function getOpenAiApiKey() {
  const value = process.env.OPENAI_API_KEY?.trim() || process.env.SORA_API_KEY?.trim();

  if (!value) {
    throw new Error("Sora is not configured. Set OPENAI_API_KEY to enable live renders.");
  }

  return value;
}

function getSoraModel(): SupportedSoraModel {
  const value = (process.env.OPENAI_SORA_MODEL ?? FALLBACK_SORA_MODEL).trim();

  if (SUPPORTED_SORA_MODELS.includes(value as SupportedSoraModel)) {
    return value as SupportedSoraModel;
  }

  throw new Error("OPENAI_SORA_MODEL must be either sora-2 or sora-2-pro.");
}

function resolveSoraSize(aspectRatio: string) {
  switch (aspectRatio) {
    case "16:9":
      return "1280x720";
    case "9:16":
      return "720x1280";
    default:
      throw new Error("Sora currently supports 16:9 and 9:16 shots in this workspace.");
  }
}

function resolveSoraSeconds(durationSeconds: number) {
  if (durationSeconds <= 4) {
    return 4;
  }

  if (durationSeconds <= 8) {
    return 8;
  }

  return 12;
}

function normalizeSoraStatus(status: string | undefined): GenerationJobStatus {
  switch (status) {
    case "completed":
      return "succeeded";
    case "failed":
      return "failed";
    case "in_progress":
      return "running";
    case "queued":
      return "queued";
    default:
      return "queued";
  }
}

function buildSoraJob(
  response: OpenAiSoraVideoResponse,
  requestMeta: {
    requestedAspectRatio?: string;
    requestedDurationSeconds?: number;
    resolvedSeconds?: number;
    resolvedSize?: string;
  },
): GenerationJob {
  if (!response.id) {
    throw new Error("OpenAI Sora did not return a video id.");
  }

  return {
    id: response.id,
    integrationMode: "live",
    outputUrl: typeof response.url === "string" ? response.url : null,
    provider: "sora",
    raw: {
      message:
        normalizeSoraStatus(response.status) === "failed"
          ? "OpenAI Sora reported a failed render."
          : "OpenAI Sora accepted the render request.",
      model: response.model,
      openaiStatus: response.status,
      progress: response.progress,
      requestedAspectRatio: requestMeta.requestedAspectRatio,
      requestedDurationSeconds: requestMeta.requestedDurationSeconds,
      resolvedSeconds: requestMeta.resolvedSeconds,
      resolvedSize: requestMeta.resolvedSize,
      video: response,
    },
    status: normalizeSoraStatus(response.status),
    thumbnailUrl:
      typeof response.poster_frame_url === "string" ? response.poster_frame_url : null,
  };
}

function extractOpenAiErrorMessage(status: number, payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return `OpenAI Sora request failed with status ${status}.`;
}

async function parseOpenAiJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("OpenAI Sora returned an invalid JSON response.");
  }
}

async function createSoraVideo(request: GenerationRequest) {
  const model = getSoraModel();
  const resolvedSize = resolveSoraSize(request.aspectRatio);
  const resolvedSeconds = resolveSoraSeconds(request.durationSeconds);
  const formData = new FormData();

  formData.append("model", model);
  formData.append("prompt", request.promptText);
  formData.append("seconds", String(resolvedSeconds));
  formData.append("size", resolvedSize);

  const response = await fetch(`${OPENAI_API_BASE_URL}/videos`, {
    body: formData,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getOpenAiApiKey()}`,
    },
    method: "POST",
  });

  if (!response.ok) {
    const payload = await parseOpenAiJson<unknown>(response).catch(() => null);
    throw new Error(extractOpenAiErrorMessage(response.status, payload));
  }

  const payload = await parseOpenAiJson<OpenAiSoraVideoResponse>(response);

  return buildSoraJob(payload, {
    requestedAspectRatio: request.aspectRatio,
    requestedDurationSeconds: request.durationSeconds,
    resolvedSeconds,
    resolvedSize,
  });
}

async function retrieveSoraVideo(jobId: string) {
  const response = await fetch(`${OPENAI_API_BASE_URL}/videos/${jobId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getOpenAiApiKey()}`,
    },
    method: "GET",
  });

  if (!response.ok) {
    const payload = await parseOpenAiJson<unknown>(response).catch(() => null);
    throw new Error(extractOpenAiErrorMessage(response.status, payload));
  }

  const payload = await parseOpenAiJson<OpenAiSoraVideoResponse>(response);

  return buildSoraJob(payload, {});
}

export const soraProvider: GenerationProviderAdapter = {
  capabilities: ["premium-cinematic", "hero-polish"],
  description: getProviderCatalogItem("sora").description,
  id: "sora",
  label: "OpenAI Sora 2",
  async enqueue(request: GenerationRequest) {
    return createSoraVideo(request);
  },
  async getJob(jobId: string) {
    return retrieveSoraVideo(jobId);
  },
  isConfigured() {
    return getProviderCatalogItem("sora").configured;
  },
};
