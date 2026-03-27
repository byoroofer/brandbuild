# BrandBuild Session Log

## 2026-03-24 17:40 CT - Repo Cleanup And Memory Init
- Established durable project memory inside the repo.
- Recorded that BrandBuild and AI Video are the same product family.
- Strengthened repo boundary protections against unrelated legacy features.

## 2026-03-24 19:25 CT - Upstream Sync Recorded
- Recorded that earlier cleanup work was already upstream.
- Preserved that sync state in structured project memory.

## 2026-03-24 18:15-18:55 CT - Full Product Audit And Control Center
- Audited the current BrandBuild stack, routes, provider adapters, storage, and auth layer.
- Added `/dashboard/settings` plus the new studio control-center surface.
- Documented the strongest current vertical slice, the biggest missing workflow layers, and the highest-value implementation order.

## 2026-03-24 19:30-19:41 CT - Production Recovery And Memory Consolidation
- Confirmed the live domain had been serving an older deployment.
- Redeployed the latest BrandBuild dashboard workspace to Vercel production.
- Verified `brandbuild.online`, `/login`, and signed-out `/dashboard` were healthy again.
- Consolidated structured memory under `docs/project-memory`, mirrored it into `.project-memory`, and kept `project-memory/` as the user-facing operating summary layer.

## 2026-03-24 23:50-23:59 CT - Production Incident Hardening
- Confirmed the live domain was on a ready deployment and public routes were healthy.
- Traced the likely crash path to authenticated dashboard client initialization before repository fallback.
- Hardened `apps/dashboard/lib/db/client.ts` to return `null` instead of throwing on server-side auth/Supabase initialization failures.
- Re-ran typecheck and build, deployed the fix to Vercel production, and verified the live domain, login page, and signed-out dashboard redirect in a browser.

## 2026-03-25 00:05-00:08 CT - Local Env Sync
- Verified that production still had the required Supabase env variables.
- Confirmed the clean repo had no local dashboard `.env.local`.
- Pulled the current production environment into `apps/dashboard/.env.local` so local runs stop throwing `NEXT_PUBLIC_SUPABASE_URL is not set`.

## 2026-03-25 00:12-00:13 CT - Git vs Production Status Check
- Confirmed the recent incident fixes are live in production.
- Confirmed they are not pushed yet: local `HEAD` and `origin/main` are still the same old commit, and the new work only exists in the working tree plus the live Vercel deploy.

## 2026-03-25 00:13-00:18 CT - Push Runtime Fixes
- Rechecked the staged BrandBuild diff and reran typecheck and build.
- Committed the runtime hardening and memory updates as `4351c81`.
- Pushed `main` so git now matches the live production fix set.

## 2026-03-25 00:20-00:28 CT - Marketing Root Static Fix
- Removed session-aware calls from `apps/dashboard/app/(marketing)/page.tsx`.
- Kept the homepage static-safe by using provider catalog plus env-based workspace readiness only.
- Re-ran typecheck and build and confirmed the Dynamic server usage warning disappeared.

## 2026-03-25 08:00-08:11 CT - Push And Deploy Static Homepage Fix
- Mirrored canonical memory updates into `.project-memory`.
- Re-ran `npm run typecheck` and `npm run build` successfully.
- Committed the batch as `6701f83` and pushed `main`.
- Deployed production to `brandbuild-online-ogvlahkwd-byoroofers-projects.vercel.app` and re-aliased `brandbuild.online`.
- Verified the live site: `/` returned `200`, `/login` returned `200`, and signed-out `/dashboard` redirected to `/login`.

## 2026-03-25 08:12-08:38 CT - Compare Workspace Batch
- Audited the existing reviews route and confirmed it was still a flat score list.
- Expanded the review read model to group candidates by shot and attach campaign, provider, generation, and average-score context.
- Rebuilt `/dashboard/reviews` into a real compare-outputs workspace with grouped navigation, media previews, filters, and focused review detail.
- Re-ran `npm run typecheck` and `npm run build` successfully.
- Committed the batch as `387f697`, pushed `main`, deployed production to `brandbuild-online-5e318lqwu-byoroofers-projects.vercel.app`, and verified healthy public routes plus correct signed-out redirects for `/dashboard` and `/dashboard/reviews`.

## 2026-03-25 08:43-09:01 CT - Assets Workspace Version And Handoff Batch
- Confirmed the next missing workflow layer after compare outputs was version grouping plus delivery prep.
- Expanded the assets read model so it derives normalized version groups and campaign handoff packages from the existing schema.
- Restored and wired `/dashboard/assets` into a three-view workspace for asset browsing, versions, and handoff preparation.
- Re-ran `npm run typecheck` and `npm run build` successfully.
- Committed the batch as `428ce4b`, pushed `main`, deployed production to `brandbuild-online-n3qvlcudy-byoroofers-projects.vercel.app`, and re-aliased `brandbuild.online`.
- Verified `brandbuild.online` returned `200` after deployment.
- Recorded the next remaining gap as campaign-level sequencing across selected outputs.

## 2026-03-25 09:10-09:34 CT - Auth Boundary Incident Hardening
- Treated the continuing live error page as a production incident rather than assuming the latest UI batch was the direct cause.
- Verified the likely brittle paths were middleware session refresh and auth email-link handling around bad cookies, expired links, or transient Supabase failures.
- Hardened `apps/dashboard/lib/supabase/middleware.ts` so session refresh failures degrade to an anonymous response instead of throwing.
- Hardened `apps/dashboard/lib/auth/email-action.ts` so callback failures redirect back to login with a safe error instead of hitting the global error page.
- Re-ran `npm run typecheck` and `npm run build` successfully.
- Deployed production to `brandbuild-online-h3jyx59f5-byoroofers-projects.vercel.app`, re-aliased `brandbuild.online`, and verified the live root returned `200`.

## 2026-03-25 12:00-12:18 CT - Public Login Path Hardening
- Confirmed the `/login` route itself was healthy and traced the issue to the public marketing shell rather than the auth page.
- Updated the public header and footer so access CTAs route directly to `/login` instead of relying on a `/dashboard` redirect.
- Marked decorative marketing layers and media chrome as `pointer-events-none` so they cannot steal clicks or taps from nearby CTAs.
- Re-ran `npm run typecheck` and `npm run build` successfully.
- Deployed production to `brandbuild-online-h0b2ffanu-byoroofers-projects.vercel.app`, re-aliased `brandbuild.online`, and verified the live root returned `200`.
- Committed the batch as `74eafe4` and pushed `main` so git matches the deployed login-navigation fix.
## 2026-03-25 12:28 CT - Repo Capture And Cross-Project Memory Link
- Confirmed the real BrandBuild Git remote is https://github.com/byoroofer/brandbuild.git.
- Verified the existing canonical local repo at D:\Playground\brandbuild-online-repo already points to that origin.
- Recorded the future relationship between BrandBuild and the local Stable Diffusion tool without merging those projects yet.
- Noted that D:\Projects\brandbuild is now a secondary local clone and should not become a competing source of truth by accident.

## 2026-03-25 12:46-15:19 CT - Campaign Repair And Provider Smoke Validation
- Repaired campaign creation by moving it onto `POST /api/campaigns` and keeping success/error handling inline in the create-campaign modal.
- Confirmed the live deployment is missing `SUPABASE_SERVICE_ROLE_KEY`, so private uploads are blocked even though the route and UI exist.
- Updated the shot uploader and settings audit so the blocked upload state is explicit instead of looking generically broken.
- Added `apps/dashboard/scripts/provider-smoke.mjs` as a reusable live provider validation harness.
- Ran the smoke test with the current env:
  - Sora accepted a real queued job: `video_69c442cd810881939bdbe6afd2d428f80824e179028ff0fc`
  - Kling failed with `Account balance not enough`
  - Higgsfield failed with `Invalid credentials`
- Re-ran typecheck and build successfully.
- Deployed production to `brandbuild-online-nwyykfvzj-byoroofers-projects.vercel.app`, re-aliased `brandbuild.online`, and verified the live root returned `200`.
- Pushed the repo upstream through commit `1a8b5b3` so GitHub matches the latest deployed state.

## 2026-03-25 - Sora Media Proxy and Storage Auth Refactor
- Confirmed from a live OpenAI request that completed Sora video status payloads can omit direct media URLs.
- Verified the actual media is retrievable from /v1/videos/{video_id}/content.
- Added BrandBuild route /api/generate/[generationId]/content to stream completed Sora media with server-side auth.
- Refactored shot uploads and storage-backed asset signing to use authenticated Supabase storage access.
- Added Supabase migration 20260325164000_assets_bucket_policies.sql for the private assets bucket and authenticated storage policies.
- Deployed production at https://brandbuild-online-dwznxfdtn-byoroofers-projects.vercel.app and re-aliased brandbuild.online.
- Remaining blockers: apply the storage migration, finish Supabase auth/email setup, fund Kling, and fix Higgsfield credentials.
## 2026-03-25 16:31-16:49 CT - Shot Reference Fallback Unblock
- Confirmed the next blocker was infrastructure rollout, not the shot workflow itself.
- Added a no-storage fallback so shots can now accept hosted HTTPS references and curated BrandBuild sample imports through the same asset route used for private uploads.
- Added a built-in BrandBuild reference sample library with cinematic image references plus a public motion-reference clip.
- Rebuilt the shot asset uploader so private upload, hosted-link, and sample-import paths all live in one premium operator surface.
- Re-ran 
pm run typecheck and 
pm run build successfully.
- Next: deploy this batch, then validate a signed-in Sora dashboard run using the new fallback reference path.

## 2026-03-25 19:55-20:02 CT - Reference-Aware Generation And Schema Triage
- Confirmed the hosted-reference and sample-import workflow was live, but Sora and Kling were still ignoring attached references at enqueue time.
- Updated the shared generation pipeline so attached shot references now enrich `provider_prompt_text` for Sora and Kling, while Higgsfield keeps its direct reference-image path.
- Verified by direct REST call that the connected live Supabase project is still missing the BrandBuild schema and currently returns `PGRST205` for `public.campaigns`.
- Hardened the campaigns surface so empty but valid live datasets stay in live mode, while missing-schema environments degrade into a clear setup state instead of surfacing raw PostgREST cache errors.
- Re-ran `npm run typecheck` and `npm run build`, committed the product batch as `2041747`, and deployed production to `https://brandbuild-online-ijil4m0yh-byoroofers-projects.vercel.app`.

## 2026-03-26 07:06 CT - Manual Supabase Bootstrap Bundle
- Inspected the current repo migrations, seed data, database types, and legacy onboarding/profile flows.
- Confirmed the repo migration chain was incomplete because account settings depended on legacy profile tables and update-trigger helpers that were never included in the migration sequence.
- Created supabase/manual/20260326_brandbuild_full_bootstrap.sql as one paste-ready SQL bundle containing the missing prerequisites, BrandBuild schema, storage policies, auth-user trigger wiring, and demo seed data.
- Recorded the new manual bootstrap path in structured and human-facing project memory so the next session can immediately resume from the same fix path.

## 2026-03-26 09:09 CT - Access And Integration Alignment Audit
- Verified the canonical Git remote is `https://github.com/byoroofer/brandbuild.git` on branch `main`.
- Verified the local Vercel link points at the `brandbuild-online` project and the CLI is authenticated to the `byoroofer` account.
- Confirmed the current Vercel production env inventory includes the OpenAI, Kling, Higgsfield, and public Supabase keys already in use.
- Added the missing safe production vars:
  - `NEXT_PUBLIC_APP_NAME`
  - `NEXT_PUBLIC_SUPPORT_EMAIL`
  - `STORAGE_BUCKET_ASSETS`
  - `STORAGE_BUCKET_EXPORTS`
- Confirmed `SUPABASE_SERVICE_ROLE_KEY` still does not appear in the current Vercel env listing.
- Confirmed Supabase CLI is installed locally but not logged in or linked for this workspace, and local `supabase status` cannot run because Docker is unavailable on this machine.
- Noted a deploy-setting mismatch to verify later: Vercel project inspect still reports the generic `Other` framework preset even though `apps/dashboard/vercel.json` declares `nextjs`.

## 2026-03-26 13:02 CT - Correct BrandBuild Supabase Project Identity
- User clarified that the real BrandBuild Supabase project is `https://ikdewffoqtliwkoywfrx.supabase.co`.
- Recorded that the previously checked `hdwneidxkakrzrhuxqcd.supabase.co` project belongs to PolitiViral, so those schema conclusions are superseded for BrandBuild.
- Reset the next infrastructure step to verify BrandBuild env and schema against `ikdewffoqtliwkoywfrx`, then rerun the bootstrap there only if the verification query shows missing tables.

## 2026-03-26 13:35 CT - BrandBuild Backend Realignment Completed
- Replaced the local dashboard env with a clean BrandBuild-only `.env.local` pointed at `ikdewffoqtliwkoywfrx.supabase.co`.
- Verified the correct Supabase backend directly: `public.campaigns` returned the seeded row `11111111-1111-1111-1111-111111111111`.
- Updated Vercel production env so `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` all point at the correct BrandBuild project.
- Found the Vercel deployment blocker: the repo head commit was authored by `BrandBuild Local <brandbuild@local.invalid>`, which Vercel refused.
- Switched the repo git identity back to `TJ Ware <info@byoroofer.com>`, committed the current integration state as `14daff9`, pushed `main`, and redeployed production successfully.
- Verified `https://brandbuild.online` and `https://brandbuild.online/login` both return `200`.

## 2026-03-26 13:50 CT - Corrected Backend Smoke Validation
- Confirmed the private `assets` bucket exists on the corrected BrandBuild project with the expected private limits and mime types.
- Inserted and deleted a temporary campaign directly through the corrected Supabase REST API to prove backend writes work.
- Uploaded and deleted a temporary PNG in the private `assets` bucket to prove storage writes work.
- Re-ran the provider smoke harness against the corrected BrandBuild env:
  - Sora queued successfully: `video_69c57e95635481918f524550c7a927690a2346e2b6e9823e`
  - Kling still fails on credits
  - Higgsfield now fails on credits rather than invalid auth
- Reduced the remaining uncertainty from backend alignment to signed-in dashboard validation plus external provider credits.

## 2026-03-26 14:00-14:29 CT - Live Dashboard Smoke Success
- Added `apps/dashboard/scripts/live-dashboard-smoke.mjs` as a reusable signed-in production smoke harness.
- Traced the shot-page production React error to locale-dependent timestamp rendering inside the client-side prompt-builder generation history.
- Replaced that timestamp output with deterministic UTC formatting in `apps/dashboard/lib/utils/dates.ts` and `apps/dashboard/components/shots/prompt-builder.tsx`.
- Updated `apps/dashboard/.gitignore` so local smoke artifacts stay out of git.
- Re-ran `npm run typecheck` and `npm run build` successfully.
- Pushed commit `35f1260` and explicitly deployed production to `brandbuild-online-qjirkgm7c-byoroofers-projects.vercel.app`, then re-aliased `brandbuild.online`.
- Verified the live signed-in operator path on production:
  - login succeeded
  - campaign creation returned `877e4747-abd1-48c2-9d97-1fa46efad01a`
  - hosted reference attachment returned asset `91a5c52d-123d-4436-8ab2-16a24cbf076c`
  - Sora queued live job `video_69c588d8cda4819198c0338739e1e30c0f5646755badeead` through generation `36e5379b-1932-4948-b7b7-ca3fcb6fbd37`
- Remaining runtime gap: refresh that queued Sora run through completion and verify the operator-facing content proxy path.

## 2026-03-27 00:03 CT - Live Sora Autorefresh Validation
- Confirmed directly that the earlier queued Sora provider job had already completed at OpenAI and that the remaining weakness was operator UX, not backend wiring.
- Added automatic live-generation polling to `apps/dashboard/components/shots/prompt-builder.tsx` so queued and running jobs refresh themselves every 12 seconds without manual babysitting.
- Added `apps/dashboard/scripts/live-generation-autorefresh-smoke.mjs` plus the `smoke:generation-autorefresh` package script for repeatable production validation.
- Re-ran `npm run typecheck` and `npm run build` successfully.
- Committed the batch as `ecd2396` and deployed production to `brandbuild-online-2pm7m4pmi-byoroofers-projects.vercel.app`, then re-aliased `brandbuild.online`.
- Verified a fresh production Sora run through the new smoke harness:
  - generation `7c37fc2b-4e9c-4830-8ff5-7d855fff1ca9`
  - automatic refresh progression: `queued` -> `running` -> `succeeded`
  - asset sync count: `1`
  - final output path: `/api/generate/7c37fc2b-4e9c-4830-8ff5-7d855fff1ca9/content`
- The Sora completion/content-proxy blocker is now cleared. Remaining live blockers are the Supabase auth trust layer plus Kling and Higgsfield credits.
