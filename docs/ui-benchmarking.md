# AI Video Site Screenshot Benchmarking

This repo includes a root-level Playwright utility for capturing current AI video generation homepage inspiration as full-page JPEG screenshots.

## What it does

- targets 10 major AI video generation platforms
- prefers the current 2026 priority set for Sora, Runway, Kling, Pika, Luma Dream Machine, Google Veo / Flow, Synthesia, HeyGen, Higgsfield, and Adobe Firefly
- substitutes additional major tools if one of the preferred sites is inaccessible during the run
- waits for load, allows animations to settle, scrolls to trigger lazy-loaded elements, and captures full-page desktop screenshots
- optionally captures a mobile pass
- writes a manifest and zips the output folder

## Output

- Desktop JPEGs: `screenshots/ai-video-sites/01-sora.jpg`, etc.
- Optional mobile JPEGs: `screenshots/ai-video-sites/01-sora-mobile.jpg`, etc.
- Manifest: `screenshots/ai-video-sites/manifest.json`
- Zip archive: `screenshots/ai-video-sites.zip`

## Run

From the repo root:

```bash
npm install
npx playwright install chromium
node scripts/ai-video-sites/script.js
```

Optional mobile capture:

```bash
node scripts/ai-video-sites/script.js --mobile
```

Package-script shortcuts:

```bash
npm run screenshots:ai-video-sites
npm run screenshots:ai-video-sites:mobile
```

## Notes

- The runner uses a desktop viewport of `1600x1200`.
- JPEG quality is set to `88`.
- Some sites may show cookie banners, geo-gates, or anti-bot interstitials. The script makes a best-effort attempt to dismiss common overlays, but the manifest records failures when a site cannot be captured cleanly.
- Generated screenshots and zip artifacts are intentionally ignored by git.
