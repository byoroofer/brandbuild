import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_BASE_URL = "https://brandbuild.online";
const DEFAULT_SHOT_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";
const DEFAULT_SMOKE_EMAIL = "smoke.dashboard.operator@brandbuild.local";
const DEFAULT_SMOKE_PASSWORD = "BrandBuildSmokePass123!";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, "..");
const ARTIFACTS_DIR = path.join(APP_DIR, ".artifacts");
const ENV_PATH = path.join(APP_DIR, ".env.local");

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    headed: false,
    shotId: DEFAULT_SHOT_ID,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === "--headed") {
      args.headed = true;
      continue;
    }

    if (current === "--base-url" && argv[index + 1]) {
      args.baseUrl = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--shot-id" && argv[index + 1]) {
      args.shotId = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const entries = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

function resolveEnv(key, localEnv) {
  const value = process.env[key] ?? localEnv[key];
  return typeof value === "string" ? value.trim() : "";
}

function ensureRequiredEnv(localEnv) {
  const supabaseUrl = resolveEnv("NEXT_PUBLIC_SUPABASE_URL", localEnv);
  const publishableKey =
    resolveEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY", localEnv) ||
    resolveEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", localEnv);
  const serviceRoleKey = resolveEnv("SUPABASE_SERVICE_ROLE_KEY", localEnv);

  const missing = [];

  if (!supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!publishableKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  }

  if (!serviceRoleKey) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required BrandBuild env values: ${missing.join(", ")}. Check ${ENV_PATH}.`,
    );
  }

  return {
    publishableKey,
    serviceRoleKey,
    supabaseUrl,
  };
}

function ensureArtifactsDir() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  return ARTIFACTS_DIR;
}

function sanitizeError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack ?? null,
    };
  }

  return {
    message: String(error),
    stack: null,
  };
}

async function fillControlledInput(locator, value) {
  await locator.fill(value, { force: true });

  if ((await locator.inputValue()) === value) {
    return;
  }

  await locator.evaluate((element, nextValue) => {
    const input = element;
    input.focus();
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.value = nextValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);

  if ((await locator.inputValue()) !== value) {
    throw new Error(`Unable to set input value for ${await locator.evaluate((node) => node.id || node.getAttribute("name") || "field")}.`);
  }
}

async function upsertSmokeUser(admin) {
  const email = DEFAULT_SMOKE_EMAIL;
  const password = DEFAULT_SMOKE_PASSWORD;
  let existingUser = null;
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const users = data?.users ?? [];
    existingUser = users.find((candidate) => candidate.email?.toLowerCase() === email);

    if (existingUser || users.length < 200) {
      break;
    }

    page += 1;
  }

  if (existingUser) {
    const { data, error } = await admin.auth.admin.updateUserById(existingUser.id, {
      email_confirm: true,
      password,
    });

    if (error) {
      throw error;
    }

    return {
      email,
      password,
      userId: data.user.id,
    };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });

  if (error) {
    throw error;
  }

  return {
    email,
    password,
    userId: data.user.id,
  };
}

async function captureJsonResponse(response) {
  const text = await response.text();

  try {
    return {
      raw: text,
      value: JSON.parse(text),
    };
  } catch {
    return {
      raw: text,
      value: null,
    };
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const localEnv = readEnvFile(ENV_PATH);
  const { publishableKey, serviceRoleKey, supabaseUrl } = ensureRequiredEnv(localEnv);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const smokeUser = await upsertSmokeUser(admin);
  const artifactsDir = ensureArtifactsDir();
  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({
    viewport: { height: 960, width: 1600 },
  });
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  let createdCampaignId = null;
  let importedAssetId = null;
  let generationId = null;

  page.on("console", (message) => {
    consoleMessages.push({
      text: message.text(),
      type: message.type(),
    });
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  try {
    await page.goto(`${args.baseUrl}/login`, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800);

    const loginEmailInput = page.locator("#login-email");
    const loginPasswordInput = page.locator("#login-password");

    await fillControlledInput(loginEmailInput, smokeUser.email);
    await fillControlledInput(loginPasswordInput, smokeUser.password);

    await page.getByRole("button", { name: "Sign in" }).click();

    const loginOutcome = await Promise.race([
      page
        .waitForURL(/\/dashboard(?:\?.*)?$/, { timeout: 30000 })
        .then(() => ({ type: "success" })),
      page
        .locator("p.rounded-2xl.border.border-rose-200")
        .waitFor({ state: "visible", timeout: 30000 })
        .then(async () => ({
          message: (await page.locator("p.rounded-2xl.border.border-rose-200").textContent())?.trim() ?? null,
          type: "error",
        })),
    ]);

    if (loginOutcome.type === "error") {
      throw new Error(`Login failed: ${loginOutcome.message ?? "Unknown error."}`);
    }

    await page.goto(`${args.baseUrl}/dashboard/campaigns`, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", { name: "Create campaign" }).first().click();

    await page.locator('input[name="name"]').fill("Live smoke campaign");
    await page.locator('input[name="clientName"]').fill("BrandBuild QA");
    await page.locator('input[name="brandName"]').fill("BrandBuild");
    await page.locator('input[name="offer"]').fill("Creative system validation");
    await page.locator('textarea[name="objective"]').fill(
      "Prove the real signed-in dashboard flow can create campaigns without falling into the global error page.",
    );
    await page.locator('textarea[name="audience"]').fill(
      "Internal operators validating the BrandBuild production stack.",
    );
    await page.locator('textarea[name="callToAction"]').fill(
      "Open the new campaign and continue into shot planning.",
    );
    await page.locator('input[name="targetPlatforms"][value="TikTok"]').check();

    const [campaignResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/campaigns") &&
          response.request().method() === "POST",
        { timeout: 60000 },
      ),
      page.locator('form button[type="submit"]').click(),
    ]);
    const campaignPayload = await captureJsonResponse(campaignResponse);
    createdCampaignId =
      typeof campaignPayload.value?.campaignId === "string"
        ? campaignPayload.value.campaignId
        : null;

    if (!campaignResponse.ok()) {
      throw new Error(
        `Campaign creation failed with ${campaignResponse.status()}: ${campaignPayload.raw}`,
      );
    }

    if (!createdCampaignId) {
      throw new Error(`Campaign response did not include campaignId: ${campaignPayload.raw}`);
    }

    await page.waitForURL(new RegExp(`/dashboard/campaigns/${createdCampaignId}$`), {
      timeout: 60000,
    });

    await page.goto(`${args.baseUrl}/dashboard/shots/${args.shotId}`, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const [assetResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/api/shots/${args.shotId}/assets`) &&
          response.request().method() === "POST",
        { timeout: 60000 },
      ),
      (async () => {
        const hostedReferenceForm = page
          .locator("form")
          .filter({ has: page.getByRole("button", { name: "Attach hosted reference" }) })
          .first();

        await fillControlledInput(
          page.locator('input[type="url"]').first(),
          `${args.baseUrl}/reference-samples/product-hero.svg`,
        );
        await fillControlledInput(
          page.locator('input[type="text"]').first(),
          "Smoke hosted product hero",
        );
        await hostedReferenceForm.evaluate((form) => form.requestSubmit());
      })(),
    ]);
    const assetPayload = await captureJsonResponse(assetResponse);
    importedAssetId =
      typeof assetPayload.value?.asset?.id === "string" ? assetPayload.value.asset.id : null;

    if (!assetResponse.ok()) {
      throw new Error(`Sample import failed with ${assetResponse.status()}: ${assetPayload.raw}`);
    }

    await page.waitForTimeout(1500);

    const [generationResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/generate") &&
          response.request().method() === "POST",
        { timeout: 60000 },
      ),
      page.getByRole("button", { name: "Generate run" }).click({ force: true }),
    ]);
    const generationPayload = await captureJsonResponse(generationResponse);
    generationId =
      typeof generationPayload.value?.generationId === "string"
        ? generationPayload.value.generationId
        : null;

    if (!generationResponse.ok()) {
      throw new Error(
        `Generation failed with ${generationResponse.status()}: ${generationPayload.raw}`,
      );
    }

    const result = {
      assetImport: {
        assetId: importedAssetId,
        status: assetResponse.status(),
        value: assetPayload.value,
      },
      campaignCreation: {
        campaignId: createdCampaignId,
        status: campaignResponse.status(),
        value: campaignPayload.value,
      },
      generation: {
        generationId,
        status: generationResponse.status(),
        value: generationPayload.value,
      },
      pageErrors,
      smokeUser: {
        email: smokeUser.email,
        userId: smokeUser.userId,
      },
      success: true,
      url: page.url(),
      warnings: consoleMessages.filter((entry) => entry.type === "warning"),
    };

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    const screenshotPath = path.join(artifactsDir, "live-dashboard-smoke-failure.png");
    const htmlPath = path.join(artifactsDir, "live-dashboard-smoke-failure.html");

    await page.screenshot({ fullPage: true, path: screenshotPath }).catch(() => {});
    fs.writeFileSync(htmlPath, await page.content().catch(() => ""), "utf8");

    console.error(
      JSON.stringify(
        {
          artifacts: {
            htmlPath,
            screenshotPath,
          },
          consoleMessages,
          createdCampaignId,
          error: sanitizeError(error),
          generationId,
          importedAssetId,
          pageErrors,
          smokeUser: {
            email: smokeUser.email,
            userId: smokeUser.userId,
          },
          success: false,
          url: page.url(),
        },
        null,
        2,
      ),
    );

    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(JSON.stringify({ error: sanitizeError(error), success: false }, null, 2));
  process.exitCode = 1;
});
