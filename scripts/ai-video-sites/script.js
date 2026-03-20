#!/usr/bin/env node

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");

const archiver = require("archiver");
const { chromium } = require("playwright");

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const OUTPUT_DIR = path.join(REPO_ROOT, "screenshots", "ai-video-sites");
const ZIP_PATH = path.join(REPO_ROOT, "screenshots", "ai-video-sites.zip");
const MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.json");

const DESKTOP_VIEWPORT = { width: 1600, height: 1200 };
const MOBILE_VIEWPORT = {
  width: 430,
  height: 932,
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
};

const JPEG_QUALITY = 88;
const NETWORK_IDLE_TIMEOUT_MS = 15_000;
const NAVIGATION_TIMEOUT_MS = 60_000;
const ACTION_TIMEOUT_MS = 20_000;
const SCREENSHOT_TIMEOUT_MS = 45_000;
const POST_LOAD_DELAY_MS = 2_500;
const BETWEEN_SCROLL_DELAY_MS = 350;
const URL_ATTEMPTS = 2;

const PRIMARY_SITES = [
  {
    slug: "sora",
    displayName: "OpenAI Sora",
    urls: ["https://openai.com/sora/"],
  },
  {
    slug: "runway",
    displayName: "Runway",
    urls: ["https://runwayml.com/", "https://runwayml.com/ai-tools/video-generation/"],
  },
  {
    slug: "kling",
    displayName: "Kling AI",
    urls: ["https://klingai.com/global/", "https://app.klingai.com/global/"],
  },
  {
    slug: "pika",
    displayName: "Pika",
    urls: ["https://pika.art/"],
  },
  {
    slug: "luma-dream-machine",
    displayName: "Luma Dream Machine",
    urls: ["https://lumalabs.ai/dream-machine", "https://dream-machine.lumalabs.ai/"],
  },
  {
    slug: "google-veo",
    displayName: "Google Veo / Flow",
    urls: ["https://labs.google/fx/tools/flow/", "https://deepmind.google/models/veo/"],
  },
  {
    slug: "synthesia",
    displayName: "Synthesia",
    urls: ["https://www.synthesia.io/"],
  },
  {
    slug: "heygen",
    displayName: "HeyGen",
    urls: ["https://www.heygen.com/"],
  },
  {
    slug: "higgsfield",
    displayName: "Higgsfield AI",
    urls: ["https://higgsfield.ai/"],
  },
  {
    slug: "adobe-firefly",
    displayName: "Adobe Firefly Video",
    urls: [
      "https://firefly.adobe.com/",
      "https://www.adobe.com/products/firefly/features/generative-ai-video.html",
    ],
  },
];

const SUBSTITUTE_SITES = [
  {
    slug: "vidu",
    displayName: "Vidu",
    urls: ["https://www.vidu.com/"],
  },
  {
    slug: "haiper",
    displayName: "Haiper",
    urls: ["https://haiper.ai/"],
  },
  {
    slug: "invideo-ai",
    displayName: "InVideo AI",
    urls: ["https://invideo.io/ai-video-generator/"],
  },
  {
    slug: "hailuo",
    displayName: "Hailuo AI",
    urls: ["https://hailuoai.video/"],
  },
];

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function ensureCleanOutputDirectory() {
  await fsp.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fsp.mkdir(OUTPUT_DIR, { recursive: true });
  await fsp.rm(ZIP_PATH, { force: true });
}

function buildOutputPath(index, slug, suffix = "") {
  const prefix = String(index).padStart(2, "0");
  return path.join(OUTPUT_DIR, `${prefix}-${slug}${suffix}.jpg`);
}

async function dismissInterruptions(page) {
  const selectors = [
    "button:has-text('Accept')",
    "button:has-text('Accept all')",
    "button:has-text('Allow all')",
    "button:has-text('I agree')",
    "button:has-text('Agree')",
    "button:has-text('Got it')",
    "button:has-text('No thanks')",
    "button[aria-label='Close']",
    "button[aria-label='close']",
    "[data-testid='close-button']",
  ];

  for (const selector of selectors) {
    const locator = page.locator(selector).first();

    try {
      if (await locator.isVisible({ timeout: 500 })) {
        await locator.click({ timeout: 1_000 });
        await delay(500);
      }
    } catch {
      // Best effort only.
    }
  }
}

async function scrollThroughPage(page) {
  await page.evaluate(
    async ({ betweenScrollDelayMs }) => {
      const maxScrollTop = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );
      const viewportHeight = window.innerHeight;
      const step = Math.max(Math.floor(viewportHeight * 0.85), 600);
      let currentScrollTop = 0;

      while (currentScrollTop + viewportHeight < maxScrollTop) {
        currentScrollTop = Math.min(currentScrollTop + step, maxScrollTop);
        window.scrollTo({ top: currentScrollTop, behavior: "auto" });
        await new Promise((resolve) => setTimeout(resolve, betweenScrollDelayMs));
      }

      window.scrollTo({ top: 0, behavior: "auto" });
    },
    { betweenScrollDelayMs: BETWEEN_SCROLL_DELAY_MS },
  );
}

async function settlePage(page) {
  await page.waitForLoadState("load", { timeout: NAVIGATION_TIMEOUT_MS }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS }).catch(() => {});
  await delay(POST_LOAD_DELAY_MS);
  await dismissInterruptions(page);
  await scrollThroughPage(page);
  await delay(1_200);
  await dismissInterruptions(page);
}

async function captureVariant(page, index, site, variant) {
  const outputPath = buildOutputPath(index, site.slug, variant.suffix);

  await page.screenshot({
    path: outputPath,
    type: "jpeg",
    quality: JPEG_QUALITY,
    fullPage: true,
    caret: "hide",
    timeout: SCREENSHOT_TIMEOUT_MS,
  });

  return outputPath;
}

async function gotoWithRetries(page, url) {
  let lastError = null;

  for (let attempt = 1; attempt <= URL_ATTEMPTS; attempt += 1) {
    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT_MS,
      });

      if (!response) {
        throw new Error("No response received from navigation.");
      }

      if (response.status() >= 400) {
        throw new Error(`Received HTTP ${response.status()}.`);
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt < URL_ATTEMPTS) {
        await delay(2_000);
      }
    }
  }

  throw lastError;
}

async function attemptSite(browser, site, index, includeMobile) {
  const desktopContext = await browser.newContext({
    viewport: DESKTOP_VIEWPORT,
    locale: "en-US",
    ignoreHTTPSErrors: true,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  });

  desktopContext.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
  desktopContext.setDefaultTimeout(ACTION_TIMEOUT_MS);

  const desktopPage = await desktopContext.newPage();
  desktopPage.on("dialog", (dialog) => dialog.dismiss().catch(() => {}));

  const errors = [];

  for (const url of site.urls) {
    try {
      log(`Opening ${site.displayName} at ${url}`);
      await gotoWithRetries(desktopPage, url);

      await settlePage(desktopPage);

      const desktopPath = await captureVariant(desktopPage, index, site, { suffix: "" });
      const result = {
        index,
        slug: site.slug,
        displayName: site.displayName,
        url,
        desktopPath,
        mobilePath: null,
        mobileError: null,
        substituted: Boolean(site.substitutedFor),
        substitutedFor: site.substitutedFor || null,
      };

      if (includeMobile) {
        const mobileContext = await browser.newContext({
          ...MOBILE_VIEWPORT,
          locale: "en-US",
          ignoreHTTPSErrors: true,
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
        });

        try {
          mobileContext.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
          mobileContext.setDefaultTimeout(ACTION_TIMEOUT_MS);

          const mobilePage = await mobileContext.newPage();
          mobilePage.on("dialog", (dialog) => dialog.dismiss().catch(() => {}));
          await gotoWithRetries(mobilePage, url);
          await settlePage(mobilePage);

          try {
            result.mobilePath = await captureVariant(mobilePage, index, site, {
              suffix: "-mobile",
            });
          } catch (mobileError) {
            result.mobileError =
              mobileError instanceof Error ? mobileError.message : String(mobileError);
            log(
              `Mobile capture skipped for ${site.displayName} at ${url}: ${result.mobileError}`,
            );
          }
        } finally {
          await mobileContext.close();
        }
      }

      await desktopContext.close();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${url} -> ${message}`);
      log(`Failed ${site.displayName} at ${url}: ${message}`);
    }
  }

  await desktopContext.close();

  throw new Error(errors.join(" | "));
}

async function writeManifest(payload) {
  await fsp.writeFile(MANIFEST_PATH, JSON.stringify(payload, null, 2), "utf8");
}

async function zipScreenshots() {
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(ZIP_PATH);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(OUTPUT_DIR, "ai-video-sites");
    archive.finalize();
  });
}

async function main() {
  const includeMobile = process.argv.includes("--mobile");

  await ensureCleanOutputDirectory();

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const successes = [];
  const failures = [];
  const queue = [...PRIMARY_SITES];
  const substitutes = [...SUBSTITUTE_SITES];

  let index = 1;

  while (successes.length < 10 && queue.length > 0) {
    const site = queue.shift();

    try {
        const capture = await attemptSite(browser, site, index, includeMobile);
        successes.push(capture);
        index += 1;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push({
        slug: site.slug,
        displayName: site.displayName,
        reason,
      });

      if (substitutes.length > 0) {
        const substitute = substitutes.shift();
        substitute.substitutedFor = site.slug;
        queue.unshift(substitute);
      }
    }
  }

  while (successes.length < 10 && substitutes.length > 0) {
    const substitute = substitutes.shift();

    try {
      const capture = await attemptSite(browser, substitute, index, includeMobile);
      successes.push(capture);
      index += 1;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push({
        slug: substitute.slug,
        displayName: substitute.displayName,
        reason,
      });
    }
  }

  await browser.close();

  const manifest = {
    capturedAt: new Date().toISOString(),
    includeMobile,
    requestedSites: PRIMARY_SITES.map((site) => ({
      slug: site.slug,
      displayName: site.displayName,
      urls: site.urls,
    })),
    captures: successes,
    failures,
    zipPath: ZIP_PATH,
  };

  await writeManifest(manifest);
  await zipScreenshots();

  log(`Captured ${successes.length} site(s).`);
  log(`Wrote screenshots to ${OUTPUT_DIR}`);
  log(`Wrote zip archive to ${ZIP_PATH}`);

  if (successes.length < 10) {
    process.exitCode = 1;
    throw new Error(
      `Only captured ${successes.length} site(s). Check ${MANIFEST_PATH} for failure details.`,
    );
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(message);
  process.exit(1);
});
