# BrandBuild Known Issues
## Critical / Active
- Supabase Auth dashboard setup is still incomplete, so branded auth emails and clean BrandBuild-native magic-link behavior are not fully live yet.
- Authenticated private uploads still need the assets bucket and storage policy migration applied in Supabase before they work end to end on production.
- Kling live validation is blocked by Account balance not enough.
- Higgsfield live validation is blocked by Invalid credentials.
- Auth callback and session-cookie failures should now recover safely, but the live auth trust layer still needs the Supabase dashboard setup finished so the full login flow feels native and reliable.
## Product Gaps
- There is still no dedicated campaign-level sequencing timeline across selected outputs.
- There is no usage/cost/admin console yet.
## Technical / Operational
- Campaign creation was moved off the server-action path and onto POST /api/campaigns so failures stay inline instead of spilling into the global error boundary.
- The repo includes pps/dashboard/scripts/provider-smoke.mjs for repeatable live provider checks outside the signed-in UI flow.
- The repo now also includes a no-storage shot fallback path: operators can attach hosted HTTPS media URLs or import curated BrandBuild sample references directly on shot detail.
- The read model can fall back to demo state too aggressively when live queries partially fail.
- The root package naming still says i-video-studio even though the product brand is BrandBuild.
- Next.js currently warns about workspace-root inference because both the parent workspace and this repo contain lockfiles.
- Local runs require pps/dashboard/.env.local; without it, routes that instantiate the Supabase client can throw missing-env errors even though production is configured.
- The repo has pre-existing unrelated worktree changes outside the scope of the current stabilization work.
### 2026-03-25 storage rollout status
- Upload code no longer depends on SUPABASE_SERVICE_ROLE_KEY for normal operator uploads.
- Production private uploads still need the assets bucket and storage policies applied in Supabase.
- Provider-output mirroring still remains blocked until SUPABASE_SERVICE_ROLE_KEY is configured.
- Hosted URLs and built-in BrandBuild sample references are now the production-safe fallback while that rollout is pending.
