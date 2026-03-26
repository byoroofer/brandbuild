# BrandBuild Integration Status
## Supabase schema bootstrap
- Manual bootstrap file ready: `D:\Playground\brandbuild-online-repo\supabase\manual\20260326_brandbuild_full_bootstrap.sql`
- What it includes: legacy profile/onboarding foundation, AI video schema, account/settings schema, assets bucket policies, auth-user trigger wiring, and demo seed data.
- User clarified on 2026-03-26 that the correct BrandBuild Supabase project is `ikdewffoqtliwkoywfrx.supabase.co`.
- The previously checked `hdwneidxkakrzrhuxqcd.supabase.co` project belongs to PolitiViral, so those schema conclusions are superseded for BrandBuild.
- Current conclusion: BrandBuild env and validation now need to be aligned to `ikdewffoqtliwkoywfrx.supabase.co`, then the schema must be verified on that exact project.
- Next technical step: verify `public.campaigns`, `public.shots`, `public.assets`, and `public.user_profiles` on `ikdewffoqtliwkoywfrx`, then rerun the full bootstrap there if any are missing.
## GitHub
- Confirmed connected: the canonical repo remote is `https://github.com/byoroofer/brandbuild.git` on branch `main`.
- No current GitHub-side blocker is proven from the repo itself.
## Vercel
- Confirmed connected: the local link in `apps/dashboard/.vercel/project.json` points at `brandbuild-online`, and the Vercel CLI is authenticated to the `byoroofer` account.
- Confirmed production env vars present: `OPENAI_API_KEY`, `KLING_API_KEY`, `KLING_API_SECRET`, `HIGGSFIELD_API_KEY`, `HIGGSFIELD_API_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
- Added in the 2026-03-26 access audit: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `STORAGE_BUCKET_ASSETS`, and `STORAGE_BUCKET_EXPORTS`.
- Still needed: verify or add `SUPABASE_SERVICE_ROLE_KEY`.
- Potential dashboard mismatch: `apps/dashboard/vercel.json` declares `framework: nextjs`, but `vercel project inspect` still reports the project preset as `Other`.
## Sora
- Adapter status: live-capable
- Current state: OpenAI-backed adapter exists and is wired into the shared generation pipeline. The 2026-03-25 provider smoke test successfully created a real queued Sora job: `video_69c442cd810881939bdbe6afd2d428f80824e179028ff0fc`.
- Still needed: run the signed-in dashboard path using the new hosted-reference or sample-import flow, then add cost/timing telemetry plus stronger refresh or webhook support.
- Reference handling: attached references now enrich `provider_prompt_text` at enqueue time, so Sora gets normalized visual guidance even before any future direct multimodal parameter wiring is verified.
## Kling
- Adapter status: live-capable
- Current state: JWT-signed adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with Account balance not enough.
- Still needed: fund or otherwise unblock the Kling account, then rerun the smoke test and validate a signed-in dashboard generation.
- Reference handling: attached references now enrich `provider_prompt_text` before Kling enqueue requests, while direct provider-native reference conditioning still remains a later documented enhancement.
## Higgsfield
- Adapter status: live-capable
- Current state: reference-image-led adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with Invalid credentials.
- Still needed: rotate or correct the Higgsfield credentials, then rerun the smoke test and validate a signed-in dashboard generation plus model-selection and refresh hardening.
## Shared Pipeline
- Working now: structured prompts, normalized generation persistence, status refresh, grouped compare outputs, asset-driven version groups and handoff packages, a repaired campaign-creation API path, a reusable provider smoke-test harness, hosted HTTPS reference linking, curated BrandBuild sample imports on shot detail, reference-aware provider prompt augmentation for attached shot assets, and a single-file manual Supabase bootstrap.
- Blocked now: BrandBuild is still not fully aligned to the correct Supabase project until env and schema verification are completed against `ikdewffoqtliwkoywfrx.supabase.co`.
- Setup hardening: empty but valid live datasets now remain in live mode, while missing-schema environments degrade into a clear setup state instead of surfacing raw PostgREST cache errors in the UI.
- Missing now: campaign-level sequencing, cost tracking, and richer admin/debug visibility.
## Auth / Trust Layer
- Code exists for branded auth emails through a Supabase Send Email Hook.
- Still needed: Supabase dashboard configuration, SMTP sender setup, and redirect cleanup so the email experience is fully BrandBuild-native.
## Supabase CLI
- Supabase CLI is installed locally.
- Still needed: `supabase login` or `SUPABASE_ACCESS_TOKEN`, plus project linking for this workspace.
- Current local limit: the repo has no `supabase/config.toml`, and `npx supabase status` cannot run on this machine because Docker is unavailable.
## 2026-03-26 schema recovery status
- One-file manual SQL bundle is now prepared inside the repo.
- The current live blocker is no longer "missing SQL file" but "correct project alignment plus schema verification on ikdewffoqtliwkoywfrx".
- After the correct project is verified and the bootstrap is confirmed there: validate campaign creation, then validate a signed-in Sora dashboard run.
