# BrandBuild Integration Status
## Supabase schema bootstrap
- Manual bootstrap file ready: `D:\Playground\brandbuild-online-repo\supabase\manual\20260326_brandbuild_full_bootstrap.sql`
- What it includes: legacy profile/onboarding foundation, AI video schema, account/settings schema, assets bucket policies, auth-user trigger wiring, and demo seed data.
- User clarified on 2026-03-26 that the correct BrandBuild Supabase project is `ikdewffoqtliwkoywfrx.supabase.co`.
- The previously checked `hdwneidxkakrzrhuxqcd.supabase.co` project belongs to PolitiViral, so those schema conclusions are superseded for BrandBuild.
- Current conclusion: BrandBuild is now aligned to `ikdewffoqtliwkoywfrx.supabase.co` locally and in Vercel production.
- Verification result: a direct REST read on 2026-03-26 returned the seeded campaign row from `public.campaigns`, confirming the schema exists on the correct BrandBuild backend.
- Next technical step: validate signed-in campaign creation, uploads, and generation through the live app instead of continuing schema triage.
## GitHub
- Confirmed connected: the canonical repo remote is `https://github.com/byoroofer/brandbuild.git` on branch `main`.
- No current GitHub-side blocker is proven from the repo itself.
## Vercel
- Confirmed connected: the local link in `apps/dashboard/.vercel/project.json` points at `brandbuild-online`, and the Vercel CLI is authenticated to the `byoroofer` account.
- Confirmed production env vars present: `OPENAI_API_KEY`, `KLING_API_KEY`, `KLING_API_SECRET`, `HIGGSFIELD_API_KEY`, `HIGGSFIELD_API_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
- Added in the 2026-03-26 access audit: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `STORAGE_BUCKET_ASSETS`, and `STORAGE_BUCKET_EXPORTS`.
- Completed on 2026-03-26: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` were all rewritten to the correct BrandBuild Supabase project and production was redeployed successfully.
- Potential dashboard mismatch: `apps/dashboard/vercel.json` declares `framework: nextjs`, but `vercel project inspect` still reports the project preset as `Other`.
- Deployment note: Vercel CLI deployments will fail if the repo head commit is authored by `BrandBuild Local <brandbuild@local.invalid>`; switching the repo author back to `TJ Ware <info@byoroofer.com>` resolved the blocker.
## Sora
- Adapter status: live-capable
- Current state: OpenAI-backed adapter exists and is wired into the shared generation pipeline. The 2026-03-25 provider smoke test successfully created a real queued Sora job: `video_69c442cd810881939bdbe6afd2d428f80824e179028ff0fc`.
- Latest validation: the 2026-03-26 smoke run against the corrected BrandBuild env successfully queued `video_69c57e95635481918f524550c7a927690a2346e2b6e9823e`.
- Latest live UI validation: the 2026-03-26 signed-in dashboard smoke run successfully attached a hosted reference and queued live Sora job `video_69c588d8cda4819198c0338739e1e30c0f5646755badeead` through generation `36e5379b-1932-4948-b7b7-ca3fcb6fbd37`.
- Still needed: refresh that queued dashboard run through completion, validate the operator-facing `/api/generate/[generationId]/content` path, then add cost/timing telemetry plus stronger refresh or webhook support.
- Reference handling: attached references now enrich `provider_prompt_text` at enqueue time, so Sora gets normalized visual guidance even before any future direct multimodal parameter wiring is verified.
## Kling
- Adapter status: live-capable
- Current state: JWT-signed adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with Account balance not enough.
- Latest validation: the 2026-03-26 smoke run against the corrected BrandBuild env still fails with `Account balance not enough`.
- Still needed: fund or otherwise unblock the Kling account, then rerun the smoke test and validate a signed-in dashboard generation.
- Reference handling: attached references now enrich `provider_prompt_text` before Kling enqueue requests, while direct provider-native reference conditioning still remains a later documented enhancement.
## Higgsfield
- Adapter status: live-capable
- Current state: reference-image-led adapter exists and is wired into the shared generation pipeline. After backend realignment, the 2026-03-26 smoke test now reaches Higgsfield but fails with `Not enough credits`.
- Still needed: add credits, then rerun the smoke test and validate a signed-in dashboard generation plus model-selection and refresh hardening.
## Shared Pipeline
- Working now: structured prompts, normalized generation persistence, status refresh, grouped compare outputs, asset-driven version groups and handoff packages, a repaired campaign-creation API path, a reusable provider smoke-test harness, hosted HTTPS reference linking, curated BrandBuild sample imports on shot detail, reference-aware provider prompt augmentation for attached shot assets, and a single-file manual Supabase bootstrap.
- Working now: BrandBuild is aligned to the correct Supabase backend and production is live again on `brandbuild.online`.
- Working now: direct campaign insert/delete smoke tests pass and the private `assets` bucket accepts uploads on the corrected backend.
- Working now: the repo-owned live dashboard smoke harness verifies sign-in, campaign creation, hosted reference attachment, and live Sora queueing on production.
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
- The schema blocker is resolved for the correct BrandBuild project.
- Signed-in product validation is now proven through login, campaign creation, hosted reference attachment, and Sora queueing on production.
- The next validation is product-level completion: refresh the queued Sora run through completion, then finish auth/email setup and the remaining provider-account unblock work.
