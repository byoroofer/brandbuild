import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const DEFAULT_BASE_URL = "https://brandbuild.online";
const DEFAULT_SHOT_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";
const DEFAULT_SMOKE_EMAIL = "smoke.dashboard.operator@brandbuild.local";
const DEFAULT_SMOKE_PASSWORD = "BrandBuildSmokePass123!";
const DEFAULT_TIMEOUT_MS = 4 * 60 * 1000;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, "..");
const ARTIFACTS_DIR = path.join(APP_DIR, ".artifacts");

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    headed: false,
    shotId: DEFAULT_SHOT_ID,
    timeoutMs: DEFAULT_TIMEOUT_MS,
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
      continue;
    }

    if (current === "--timeout-ms" && argv[index + 1]) {
      const nextValue = Number(argv[index + 1]);

      if (Number.isFinite(nextValue) && nextValue > 0) {
        args.timeoutMs = nextValue;
      }

      index += 1;
    }
  }

  return args;
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

async function login(page, baseUrl) {
  await page.goto(`${baseUrl}/login`, {
    timeout: 60000,
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
  await fillControlledInput(page.locator("#login-email"), DEFAULT_SMOKE_EMAIL);
  await fillControlledInput(page.locator("#login-password"), DEFAULT_SMOKE_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  const loginOutcome = await Promise.race([
    page
      .waitForURL(/\/dashboard(?:\?.*)?$/, { timeout: 30000 })
      .then(() => ({ type: "success" })),
    page
      .locator("p.rounded-2xl.border.border-rose-200")
      .waitFor({ state: "visible", timeout: 30000 })
      .then(async () => ({
        message:
          (await page.locator("p.rounded-2xl.border.border-rose-200").textContent())?.trim() ??
          null,
        type: "error",
      })),
  ]);

  if (loginOutcome.type === "error") {
    throw new Error(`Login failed: ${loginOutcome.message ?? "Unknown error."}`);
  }
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
    throw new Error("Unable to set controlled login input value.");
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const artifactsDir = ensureArtifactsDir();
  const browser = await chromium.launch({ headless: !args.headed });
  const page = await browser.newPage({
    viewport: { height: 960, width: 1600 },
  });
  const pageErrors = [];
  const consoleMessages = [];
  const refreshResponses = [];
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
    await login(page, args.baseUrl);

    await page.goto(`${args.baseUrl}/dashboard/shots/${args.shotId}`, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const generationResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/generate") &&
        !response.url().includes("/api/generate/") &&
        response.request().method() === "POST",
      { timeout: 60000 },
    );

    await page.getByRole("button", { name: "Generate run" }).click({ force: true });

    const generationResponse = await generationResponsePromise;
    const generationPayload = await generationResponse.json().catch(() => null);

    generationId =
      typeof generationPayload?.generationId === "string"
        ? generationPayload.generationId
        : null;

    if (!generationResponse.ok() || !generationId) {
      throw new Error(
        `Generation trigger failed with ${generationResponse.status()}: ${JSON.stringify(
          generationPayload,
        )}`,
      );
    }

    const startedAt = Date.now();
    let completedRefresh = null;

    while (Date.now() - startedAt < args.timeoutMs) {
      const refreshResponse = await page.waitForResponse(
        (response) =>
          response.url().includes(`/api/generate/${generationId}`) &&
          !response.url().includes("/content") &&
          response.request().method() === "POST",
        { timeout: 30000 },
      );
      const refreshPayload = await refreshResponse.json().catch(() => null);

      refreshResponses.push({
        payload: refreshPayload,
        status: refreshResponse.status(),
      });

      if (
        refreshResponse.ok() &&
        refreshPayload?.status === "succeeded" &&
        refreshPayload?.outputUrl === `/api/generate/${generationId}/content`
      ) {
        completedRefresh = refreshPayload;
        break;
      }
    }

    if (!completedRefresh) {
      throw new Error(
        `Timed out waiting for auto-refresh completion for generation ${generationId}.`,
      );
    }

    await page.waitForSelector(`a[href="/api/generate/${generationId}/content"]`, {
      timeout: 30000,
    });

    console.log(
      JSON.stringify(
        {
          completedRefresh,
          consoleWarnings: consoleMessages.filter((entry) => entry.type === "warning"),
          generationId,
          pageErrors,
          refreshResponses,
          success: true,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const screenshotPath = path.join(artifactsDir, "live-generation-autorefresh-smoke-failure.png");
    const htmlPath = path.join(artifactsDir, "live-generation-autorefresh-smoke-failure.html");

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
          error: sanitizeError(error),
          generationId,
          pageErrors,
          refreshResponses,
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
