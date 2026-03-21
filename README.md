# AI Video Studio

Internal dashboard for planning, generating, organizing, and reviewing AI marketing video production across Sora, Kling, and Higgsfield.

The maintained product surface lives in `apps/dashboard`. This repo still contains older inherited routes and packages, but AI Video Studio is the primary supported internal app.

## Stack

- Next.js App Router
- TypeScript
- Tailwind
- Supabase
- Vercel

## Core features

- Campaign planning
- Scene and shot management
- Structured prompt builder
- Provider routing
- Asset library
- Reviews and selects
- Live Sora, Kling, and Higgsfield provider adapters behind one shared generation contract
- Automatic asset-row sync when successful live generations return output URLs
- Studio Agent dock in the dashboard command bar
- Current tag discovery from typed briefs or short voice notes

## Local setup

1. Install `pnpm`.
2. Install dependencies with `pnpm install`.
3. Copy `.env.example` to `apps/dashboard/.env.local` or start from `apps/dashboard/.env.example`.
4. Add your Supabase keys and provider env vars.
5. Run the studio schema in `supabase/migrations/20260319113000_ai_video_studio_foundation.sql`.
6. Seed demo data from `supabase/seed.sql`.
7. Start the dev server with `pnpm dev`.

Notes:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are all supported for the public Supabase browser key.
- `SUPABASE_SERVICE_ROLE_KEY` is optional in this pass and should stay server-side only.
- `SUPABASE_SERVICE_ROLE_KEY` is required if you want successful live provider outputs mirrored into Supabase Storage instead of remaining provider-hosted URLs only.
- `NEXT_PUBLIC_APP_URL` is recommended for your custom production domain, but the app can also fall back to Vercel's deployment URL envs when that value is not set.
- `OPENAI_API_KEY` enables the live OpenAI Sora video enqueue path, the Studio Agent, live web-backed tag discovery, and voice note transcription.
- `OPENAI_SORA_MODEL` is optional and supports `sora-2` or `sora-2-pro`.
- `OPENAI_STUDIO_AGENT_MODEL` is optional. Set it to `gpt-5.1-codex` for a Codex-backed internal operator agent, or `gpt-5.4` for the flagship general reasoning model.
- `OPENAI_TAG_DISCOVERY_MODEL` is optional and defaults to `gpt-5-mini` for fast current-tag scans in the dashboard command bar.
- `OPENAI_TRANSCRIBE_MODEL` is optional and defaults to `gpt-4o-mini-transcribe` for short voice-note transcription.
- Without `OPENAI_API_KEY`, the tag discovery dock still works for typed briefs, but it clearly falls back to relevance-only local suggestions and cannot transcribe audio notes.
- Kling now has a live-capable adapter with JWT auth, env-configurable endpoint overrides, and generation status sync. Without Kling credentials, it still falls back to explicit mock runs so the internal workflow keeps moving.
- Higgsfield is now live-capable through the REST API and defaults to the `higgsfield-ai/dop/standard` model for reference-driven cinematic exploration.
- The optional Kling overrides let you adapt to account-specific or region-specific API path differences without changing app code:
  - `KLING_API_BASE_URL`
  - `KLING_API_CREATE_PATH`
  - `KLING_API_STATUS_PATH_TEMPLATE`
  - `KLING_API_MODEL_NAME`
  - `KLING_API_MODE`
  - `KLING_API_SOUND_MODE`
  - `KLING_API_TOKEN_TTL_SECONDS`

## Commands

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm typecheck`

A dedicated `pnpm lint` script is not wired in this repo yet.

## Folder structure

The app is organized to stay monorepo-friendly while keeping one clean internal dashboard as the deployable surface:

- `apps/dashboard`: Next.js app, routes, UI, server actions, route handlers
- `apps/dashboard/lib/db`: typed operational helpers for studio data writes and reads
- `apps/dashboard/lib/providers`: provider router boundary for Sora, Kling, and Higgsfield
- `apps/dashboard/lib/studio`: studio read model, demo data, routing logic, validation
- `apps/dashboard/lib/agents`: internal operator services for Studio Agent and dashboard tag discovery
- `apps/dashboard/lib/supabase`: server-safe and browser-safe Supabase utilities
- `supabase`: SQL migrations and seed data
- `packages`: reserved shared workspace packages for UI, prompt logic, media utilities, and config
- `docs`: architecture and workflow notes

## Provider strategy

- Sora for premium cinematic hero shots
- Kling for motion-driven character and action shots
- Higgsfield for creative experimentation and exploratory studio workflows

All provider integrations stay behind internal adapters so credentials, raw payloads, and future API details remain server-side.

Current implementation:

- Sora is wired to OpenAI's `POST /v1/videos` and `GET /v1/videos/{video_id}` endpoints when `OPENAI_API_KEY` is present.
- The studio currently normalizes Sora requests to supported workspace-friendly aspect ratios (`16:9`, `9:16`) and duration buckets (`4`, `8`, `12` seconds).
- Kling is wired behind the same adapter contract with JWT-based auth, text-to-video enqueue, status refresh, and output URL persistence when Kling credentials are present.
- Successful live generation refreshes now upsert `generated_video` and `thumbnail` asset rows automatically when the provider returns usable URLs.
- When `SUPABASE_SERVICE_ROLE_KEY` is present, those auto-synced asset rows are also mirrored into the `STORAGE_BUCKET_ASSETS` bucket and resolved back to signed URLs in the internal UI.
- The Kling live path currently defaults to the global API base `https://api-singapore.klingai.com` and the common `text2video` task routes, with env overrides available if your account docs differ.
- Higgsfield uses the same generation history, refresh, and asset-sync pipeline as the other providers, with mock fallback when credentials are not configured.
- The command bar includes a Studio Agent that uses OpenAI when configured and falls back to grounded local guidance when it is not.
- The command bar also includes a tag discovery dock that can:
  - accept a typed search brief
  - accept a short recorded voice note
  - use OpenAI web-backed search for current tag signals when available
  - fall back to relevance-only local tags when current live search is unavailable

## Status

V1 internal dashboard with:

- Supabase-backed studio schema
- premium dark operator UI
- campaigns, shots, assets, and reviews pages
- structured prompt builder on shot detail
- live Sora generation workflow that writes `shot_generations`
- live-capable Kling and Higgsfield generation workflows with mock fallback when credentials are missing
- dashboard-level Studio Agent for routing, prompt, and next-step guidance
- dashboard-level tag discovery for current creative tags and voice-note brief input

Still intentionally out of scope in this pass:

- background queues
- Sora webhook handling and automatic status sync
- automatic video download and asset ingestion from completed Sora jobs
- automatic asset ingestion from completed Kling jobs
- production webhook handling for Higgsfield (polling is live now; webhook sync is the next step)
- upload pipeline automation
- consumer-facing product flows

## Deployment

Deploy `apps/dashboard` to Vercel and configure the same environment variables used locally.

For auth and canonical URLs:

- set `NEXT_PUBLIC_APP_URL` to your production domain when you are ready to cut over
- add your local callback URL and production callback URL to Supabase Auth redirect settings
- the app can fall back to `VERCEL_PROJECT_PRODUCTION_URL` and `VERCEL_URL` for safer defaults on Vercel

Voice note capture requires a secure context in the browser. `localhost` works for development, and HTTPS is required on deployed environments.

## Docs

- `docs/architecture.md`
- `docs/workflow.md`
- `docs/provider-strategy.md`
- `docs/prompt-system.md`
- `docs/product-brief.md`
