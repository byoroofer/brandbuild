# BrandBuild

BrandBuild is an enterprise AI video generation platform that uses Sora 2, Kling, and Higgsfield to produce polished final videos through one controlled workflow.

The maintained product surface lives in `apps/dashboard`. This repo still contains older inherited routes and packages, but BrandBuild is the primary supported app.

## Stack

- Next.js App Router
- TypeScript
- Tailwind
- Supabase
- Vercel

## Core product areas

- Campaign planning
- Scene and shot management
- Structured prompt builder
- Provider routing
- Asset library
- Reviews and selects
- Live-capable Sora, Kling, and Higgsfield adapters behind one shared generation contract
- Automatic asset-row sync when successful live generations return output URLs
- Studio Agent dock in the dashboard command bar
- Current tag discovery from typed briefs or short voice notes
- Branded auth email delivery through a Supabase Send Email Hook and custom SMTP provider

## Local setup

1. Install `pnpm`.
2. Install dependencies with `pnpm install`.
3. Copy `.env.example` to `apps/dashboard/.env.local` or start from `apps/dashboard/.env.example`.
4. Add your Supabase keys and provider env vars.
5. If you want branded auth emails locally, copy `supabase/functions/.env.example` to `supabase/functions/.env`.
6. Run the studio schema in `supabase/migrations/20260319113000_ai_video_studio_foundation.sql`.
7. Run the account settings schema in `supabase/migrations/20260320113000_account_settings_foundation.sql`.
8. Seed demo data from `supabase/seed.sql`.
9. Start the dev server with `pnpm dev`.

## Commands

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm typecheck`

A dedicated `pnpm lint` script is not wired in this repo yet.

## Folder structure

- `apps/dashboard`: Next.js app, routes, UI, server actions, route handlers
- `apps/dashboard/lib/db`: typed operational helpers for studio data writes and reads
- `apps/dashboard/lib/providers`: provider router boundary for Sora, Kling, and Higgsfield
- `apps/dashboard/lib/studio`: studio read model, demo data, routing logic, validation
- `apps/dashboard/lib/agents`: internal operator services for Studio Agent and dashboard tag discovery
- `apps/dashboard/lib/supabase`: server-safe and browser-safe Supabase utilities
- `supabase/migrations`: SQL migrations and seed data
- `supabase/functions/send-auth-email`: branded Send Email Hook for Supabase Auth
- `packages`: reserved shared workspace packages for UI, prompt logic, media utilities, and config
- `docs`: architecture and workflow notes

## Provider strategy

- Sora for premium cinematic hero shots
- Kling for motion-driven character and action shots
- Higgsfield for creative experimentation and exploratory studio workflows

All provider integrations stay behind internal adapters so credentials, raw payloads, and future API details remain server-side.

## Branded auth emails

BrandBuild uses the Supabase Send Email Hook path instead of Supabase’s default shared email sender.

### Chosen architecture

- Supabase remains the auth backend.
- A Supabase Edge Function at `supabase/functions/send-auth-email` becomes the email sender.
- That function sends through your own SMTP provider using branded sender credentials.
- All auth email HTML, text, subjects, and support footer copy are rendered by us.
- Links point to app-native routes such as `/auth/confirm`, `/auth/callback`, and `/reset-password`.

### Why this path

- It removes Supabase’s default sender identity from the user-facing experience.
- It gives full control over subjects, copy, and layout across signup, invite, magic link, recovery, email change, and reauthentication.
- It keeps Supabase behind the scenes while preserving the existing auth backend.

### Required environment variables

App / Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Supabase function secrets:

- `SEND_EMAIL_HOOK_SECRET`
- `AUTH_EMAIL_APP_NAME`
- `AUTH_EMAIL_FROM_NAME`
- `AUTH_EMAIL_FROM_EMAIL`
- `AUTH_EMAIL_REPLY_TO`
- `AUTH_SUPPORT_EMAIL`
- `AUTH_EMAIL_SITE_URL`
- `AUTH_EMAIL_LOGO_URL`
- `AUTH_EMAIL_SMTP_HOST`
- `AUTH_EMAIL_SMTP_PORT`
- `AUTH_EMAIL_SMTP_SECURE`
- `AUTH_EMAIL_SMTP_USER`
- `AUTH_EMAIL_SMTP_PASSWORD`

### Manual Supabase dashboard steps

1. Go to `Authentication -> URL Configuration`.
2. Set `Site URL` to your real app origin, for example `https://brandbuild.online`.
3. Add redirect URLs for:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/confirm`
   - `http://localhost:3000/reset-password`
   - `https://brandbuild.online/auth/callback`
   - `https://brandbuild.online/auth/confirm`
   - `https://brandbuild.online/reset-password`
4. Keep `Email provider` enabled in `Authentication -> Providers -> Email`.
5. Go to `Authentication -> Hooks`.
6. Create a `Send Email` hook that points to your deployed Supabase Edge Function URL:
   - `https://<project-ref>.supabase.co/functions/v1/send-auth-email`
7. Generate a hook secret and store it as `SEND_EMAIL_HOOK_SECRET`.
8. If you use secure email change, leave `Secure Email Change` enabled so both the current and new address must confirm.
9. If you still have old SMTP settings inside Supabase Auth, they are ignored while the Send Email Hook is enabled.

### Deploy the hook

1. Copy `supabase/functions/.env.example` to `supabase/functions/.env`.
2. Fill in your SMTP sender settings and hook secret.
3. Set secrets in Supabase:

   ```bash
   supabase secrets set --env-file supabase/functions/.env
   ```

4. Deploy the function:

   ```bash
   supabase functions deploy send-auth-email --no-verify-jwt
   ```

### DNS and sender-domain steps

For branded email delivery:

1. Add and verify your sending domain with your SMTP provider.
2. Publish the provider’s required SPF and DKIM records.
3. Add a DMARC record for the sending domain.
4. Use a sender such as `no-reply@brandbuild.online` or `no-reply@auth.brandbuild.online`.

For a branded Supabase auth/API domain:

1. Choose a subdomain such as `auth.brandbuild.online` or `api.brandbuild.online`.
2. In Supabase custom domains, create the domain entry.
3. Add the required CNAME pointing to your project’s default Supabase hostname.
4. Add the `_acme-challenge` TXT record Supabase gives you.
5. Reverify and activate the domain in Supabase.
6. After activation, update `NEXT_PUBLIC_SUPABASE_URL` to the branded custom domain if you want the app and OAuth callbacks to stop exposing the raw project hostname.

### Email rendering checklist

Run these flows after enabling the hook and sender domain:

- Sign up confirmation
- Magic link login
- Forgot password
- Invite
- Email change
- Reauthentication

For each flow, verify:

- sender name is BrandBuild
- sender email is your branded domain
- subject line is branded and not generic Supabase copy
- HTML renders correctly in desktop Gmail and Outlook
- HTML renders correctly in mobile Gmail and iOS Mail
- CTA link lands on a BrandBuild route
- support footer shows the correct support inbox

## Auth routes used by branded emails

- `/auth/confirm`: token-hash email verification route
- `/auth/callback`: code exchange and fallback callback route
- `/reset-password`: reset email landing page and password update UI

## Notes

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are all supported for the public Supabase browser key.
- `SUPABASE_SERVICE_ROLE_KEY` is optional in this pass and should stay server-side only.
- `SUPABASE_SERVICE_ROLE_KEY` is required if you want successful live provider outputs mirrored into Supabase Storage instead of remaining provider-hosted URLs only.
- `OPENAI_API_KEY` enables the live OpenAI Sora video enqueue path, the Studio Agent, live web-backed tag discovery, and voice note transcription.
- `OPENAI_SORA_MODEL` is optional and supports `sora-2` or `sora-2-pro`.
- `OPENAI_STUDIO_AGENT_MODEL` is optional. Set it to `gpt-5.1-codex` for a Codex-backed internal operator agent, or `gpt-5.4` for the flagship general reasoning model.
- `OPENAI_TAG_DISCOVERY_MODEL` is optional and defaults to `gpt-5-mini` for fast current-tag scans in the dashboard command bar.
- `OPENAI_TRANSCRIBE_MODEL` is optional and defaults to `gpt-4o-mini-transcribe` for short voice-note transcription.
- Without `OPENAI_API_KEY`, the tag discovery dock still works for typed briefs, but it clearly falls back to relevance-only local suggestions and cannot transcribe audio notes.
- Kling now has a live-capable adapter with JWT auth, env-configurable endpoint overrides, and generation status sync.
- Higgsfield is live-capable through the REST API and defaults to `higgsfield-ai/dop/standard` for reference-driven cinematic exploration.

## Deployment

Deploy `apps/dashboard` to Vercel and configure the same environment variables used locally.

For auth and canonical URLs:

- set `NEXT_PUBLIC_APP_URL` to your production domain
- add your local and production callback URLs to Supabase Auth redirect settings
- if you activate a Supabase custom domain, update `NEXT_PUBLIC_SUPABASE_URL` to that branded domain

Voice note capture requires a secure context in the browser. `localhost` works for development, and HTTPS is required on deployed environments.

## Status

BrandBuild currently includes:

- Supabase-backed studio schema
- premium dark operator UI
- campaigns, shots, assets, and reviews pages
- structured prompt builder on shot detail
- live-capable Sora, Kling, and Higgsfield provider workflows with mock fallback when credentials are missing
- dashboard-level Studio Agent for routing, prompt, and next-step guidance
- dashboard-level tag discovery for current creative tags and voice-note brief input
- branded auth email infrastructure through a Supabase Send Email Hook and SMTP sender

Still intentionally out of scope in this pass:

- background queues
- webhook-based generation orchestration
- automatic provider-download ingestion for every engine
- consumer-facing product flows
