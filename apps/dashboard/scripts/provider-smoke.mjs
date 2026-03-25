#!/usr/bin/env node

import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");

const DEFAULT_PROVIDER = "all";
const DEFAULT_REFERENCE_IMAGE_URL =
  "https://dummyimage.com/1024x1024/111827/f8fafc.png&text=BrandBuild+Reference";
const DEFAULT_SORA_PROMPT =
  "A premium cinematic product hero shot of a matte black energy drink can rotating slowly in a dark reflective studio, dramatic rim lighting, condensation, polished commercial realism.";
const DEFAULT_KLING_PROMPT =
  "A stylish creator steps into frame, lifts a sleek product can, and reacts with a confident refreshed expression, controlled handheld motion, premium social ad realism.";
const DEFAULT_HIGGSFIELD_PROMPT =
  "A cinematic motion study that turns this reference image into a polished premium product reveal with subtle camera drift, dramatic lighting, and elegant commercial movement.";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const parsed = {
    help: false,
    provider: DEFAULT_PROVIDER,
    referenceImageUrl: DEFAULT_REFERENCE_IMAGE_URL,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--help" || value === "-h") {
      parsed.help = true;
      continue;
    }

    if (value === "--provider" && argv[index + 1]) {
      parsed.provider = argv[index + 1].trim().toLowerCase();
      index += 1;
      continue;
    }

    if (value === "--reference-image-url" && argv[index + 1]) {
      parsed.referenceImageUrl = argv[index + 1].trim();
      index += 1;
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`BrandBuild provider smoke test

Usage:
  node ./scripts/provider-smoke.mjs [--provider sora|kling|higgsfield|all] [--reference-image-url URL]

Notes:
  - Uses apps/dashboard/.env.local when present.
  - Creates real provider jobs when the required keys are available.
  - Reports upload readiness, including whether SUPABASE_SERVICE_ROLE_KEY is configured.
`);
}

function maskValue(value) {
  if (!value) {
    return "missing";
  }

  if (value.length <= 8) {
    return "***";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function readPublicKeyPresence() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function buildReadinessSnapshot() {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "missing",
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    hasSupabasePublicKey: readPublicKeyPresence(),
    hasSupabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    higgsfieldApiKey: maskValue(process.env.HIGGSFIELD_API_KEY ?? process.env.HF_API_KEY ?? ""),
    klingApiKey: maskValue(process.env.KLING_API_KEY ?? ""),
    openAiKey: maskValue(process.env.OPENAI_API_KEY ?? ""),
    uploadReady: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        readPublicKeyPresence() &&
        process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  };
}

function getOpenAiApiKey() {
  const value = process.env.OPENAI_API_KEY?.trim() || process.env.SORA_API_KEY?.trim();

  if (!value) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  return value;
}

function getKlingCredentials() {
  const apiKey = process.env.KLING_API_KEY?.trim();
  const apiSecret = process.env.KLING_API_SECRET?.trim();

  if (!apiKey || !apiSecret) {
    throw new Error("KLING_API_KEY or KLING_API_SECRET is missing.");
  }

  return {
    apiKey,
    apiSecret,
  };
}

function getHiggsfieldCredentials() {
  const apiKey =
    process.env.HIGGSFIELD_API_KEY?.trim() ?? process.env.HF_API_KEY?.trim() ?? null;
  const apiSecret =
    process.env.HIGGSFIELD_API_SECRET?.trim() ?? process.env.HF_API_SECRET?.trim() ?? null;

  if (!apiKey || !apiSecret) {
    throw new Error("HIGGSFIELD_API_KEY or HIGGSFIELD_API_SECRET is missing.");
  }

  return {
    apiKey,
    apiSecret,
  };
}

function parseJsonSafely(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      rawText: text,
    };
  }
}

async function parseResponse(response) {
  const text = await response.text();
  return parseJsonSafely(text);
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signKlingJwt() {
  const credentials = getKlingCredentials();
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 1800;
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

async function runSoraSmokeTest() {
  const formData = new FormData();
  formData.append("model", (process.env.OPENAI_SORA_MODEL ?? "sora-2").trim());
  formData.append("prompt", DEFAULT_SORA_PROMPT);
  formData.append("seconds", "4");
  formData.append("size", "1280x720");

  const response = await fetch("https://api.openai.com/v1/videos", {
    body: formData,
    headers: {
      Authorization: `Bearer ${getOpenAiApiKey()}`,
    },
    method: "POST",
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ??
        payload?.message ??
        `OpenAI Sora request failed with status ${response.status}.`,
    );
  }

  return {
    jobId: typeof payload.id === "string" ? payload.id : null,
    outputUrl: typeof payload.url === "string" ? payload.url : null,
    provider: "sora",
    status: payload.status ?? "queued",
    thumbnailUrl:
      typeof payload.poster_frame_url === "string" ? payload.poster_frame_url : null,
  };
}

async function runKlingSmokeTest() {
  const response = await fetch("https://api-singapore.klingai.com/v1/videos/text2video", {
    body: JSON.stringify({
      aspect_ratio: "16:9",
      duration: "5",
      mode: (process.env.KLING_API_MODE ?? "std").trim().toLowerCase() === "pro" ? "pro" : "std",
      model_name: (process.env.KLING_API_MODEL_NAME ?? "kling-v2-6").trim(),
      prompt: DEFAULT_KLING_PROMPT,
      sound: (process.env.KLING_API_SOUND_MODE ?? "off").trim().toLowerCase() === "on" ? "on" : "off",
    }),
    headers: {
      Authorization: `Bearer ${signKlingJwt()}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(payload?.message ?? `Kling request failed with status ${response.status}.`);
  }

  if (typeof payload.code === "number" && payload.code !== 0) {
    throw new Error(payload.message ?? `Kling request failed with code ${payload.code}.`);
  }

  const record = payload.data ?? payload.output ?? {};
  const resultPayload = record.task_result ?? record.result ?? {};
  const primaryVideo = Array.isArray(resultPayload.videos) ? resultPayload.videos[0] : null;

  return {
    jobId: typeof record.task_id === "string" ? record.task_id : null,
    outputUrl:
      primaryVideo?.url ??
      primaryVideo?.download_url ??
      resultPayload.download_url ??
      null,
    provider: "kling",
    status: record.task_status ?? "queued",
    thumbnailUrl:
      primaryVideo?.thumbnail_url ??
      primaryVideo?.cover_url ??
      primaryVideo?.poster_url ??
      resultPayload.thumbnail_url ??
      resultPayload.cover_url ??
      resultPayload.poster_url ??
      null,
  };
}

async function runHiggsfieldSmokeTest(referenceImageUrl) {
  const credentials = getHiggsfieldCredentials();
  const modelId = (process.env.HIGGSFIELD_MODEL_ID ?? "higgsfield-ai/dop/standard")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  const response = await fetch(`https://platform.higgsfield.ai/${modelId}`, {
    body: JSON.stringify({
      duration: Number(process.env.HIGGSFIELD_DURATION_SECONDS ?? 5),
      image_url: referenceImageUrl,
      prompt: DEFAULT_HIGGSFIELD_PROMPT,
    }),
    headers: {
      Accept: "application/json",
      Authorization: `Key ${credentials.apiKey}:${credentials.apiSecret}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      payload?.error ??
        payload?.detail ??
        payload?.message ??
        `Higgsfield request failed with status ${response.status}.`,
    );
  }

  return {
    jobId: payload.request_id ?? null,
    outputUrl: payload.video?.url ?? null,
    provider: "higgsfield",
    status: payload.status ?? "queued",
    thumbnailUrl: Array.isArray(payload.images) ? payload.images[0]?.url ?? null : null,
  };
}

async function run() {
  loadEnvFile(path.join(appRoot, ".env.local"));
  loadEnvFile(path.join(appRoot, ".env"));

  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const requestedProviders =
    args.provider === "all"
      ? ["sora", "kling", "higgsfield"]
      : [args.provider];

  const results = [];
  let hasFailure = false;

  for (const provider of requestedProviders) {
    try {
      if (provider === "sora") {
        results.push({
          ok: true,
          ...(await runSoraSmokeTest()),
        });
        continue;
      }

      if (provider === "kling") {
        results.push({
          ok: true,
          ...(await runKlingSmokeTest()),
        });
        continue;
      }

      if (provider === "higgsfield") {
        results.push({
          ok: true,
          ...(await runHiggsfieldSmokeTest(args.referenceImageUrl)),
        });
        continue;
      }

      hasFailure = true;
      results.push({
        error: `Unknown provider "${provider}". Use sora, kling, higgsfield, or all.`,
        ok: false,
        provider,
      });
    } catch (error) {
      hasFailure = true;
      results.push({
        error: error instanceof Error ? error.message : "Unknown error",
        ok: false,
        provider,
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    readiness: buildReadinessSnapshot(),
    referenceImageUrl: args.referenceImageUrl,
    results,
  };

  console.log(JSON.stringify(report, null, 2));

  if (hasFailure) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : "Unknown script failure",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
