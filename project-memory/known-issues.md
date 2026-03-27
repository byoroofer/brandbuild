# BrandBuild Known Issues
## Critical / Active
- Supabase Auth dashboard setup is still incomplete, so branded auth emails and clean BrandBuild-native magic-link behavior are not fully live yet.
- Kling live validation is blocked by Account balance not enough.
- Higgsfield live validation is blocked by insufficient credits.
- Auth callback and session-cookie failures should now recover safely, but the live auth trust layer still needs the Supabase dashboard setup finished so the full login flow feels native and reliable.
## Product Gaps
- There is still no dedicated campaign-level sequencing timeline across selected outputs.
- There is no usage/cost/admin console yet.
## Technical / Operational
- Campaign creation was moved off the server-action path and onto POST /api/campaigns so failures stay inline instead of spilling into the global error boundary.
- The repo includes `apps/dashboard/scripts/provider-smoke.mjs` for repeatable live provider checks outside the signed-in UI flow.
- The repo now also includes `apps/dashboard/scripts/live-dashboard-smoke.mjs` for repeatable signed-in production validation across login, campaign creation, asset attachment, and generation queueing.
- The repo now also includes `apps/dashboard/scripts/live-generation-autorefresh-smoke.mjs` for repeatable signed-in production validation of automatic generation polling through completion and BrandBuild-owned output playback.
- The repo now also includes a no-storage shot fallback path: operators can attach hosted HTTPS media URLs or import curated BrandBuild sample references directly on shot detail.
- The shot workspace now auto-refreshes queued and running live generations every 12 seconds, so operators no longer need to babysit the Refresh status button for Sora completions.
- Attached shot references now enrich `provider_prompt_text` for Sora and Kling, but direct provider-native multimodal reference parameters are still unverified and unshipped.
- The read model can fall back to demo state too aggressively when live queries partially fail.
- The root package naming still says `ai-video-studio` even though the product brand is BrandBuild.
- Next.js currently warns about workspace-root inference because both the parent workspace and this repo contain lockfiles.
- Local runs require `apps/dashboard/.env.local`; without it, routes that instantiate the Supabase client can throw missing-env errors even though production is configured.
- The repo has pre-existing unrelated worktree changes outside the scope of the current stabilization work.
### 2026-03-26 schema rollout status
- The one-file manual bootstrap SQL now exists in `supabase/manual/20260326_brandbuild_full_bootstrap.sql`.
- The connected BrandBuild project is now aligned and serving the expected schema plus storage bucket.
- Provider-output mirroring still remains blocked until `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Hosted URLs and built-in BrandBuild sample references remain the production-safe fallback while private storage rollout is still pending.
