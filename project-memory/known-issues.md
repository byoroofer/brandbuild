# BrandBuild Known Issues

## Critical / Active
- Supabase Auth dashboard setup is still incomplete, so branded auth emails and clean BrandBuild-native magic-link behavior are not fully live yet.
- Private uploads are blocked on the live deployment because `SUPABASE_SERVICE_ROLE_KEY` is not configured.
- Kling live validation is blocked by `Account balance not enough`.
- Higgsfield live validation is blocked by `Invalid credentials`.
- Auth callback and session-cookie failures should now recover safely, but the live auth trust layer still needs the Supabase dashboard setup finished so the full login flow feels native and reliable.
- If a previously loaded tab still shows stale login behavior, it may be serving cached client state from an older deployment; retest from a hard refresh or fresh tab against the latest deployment before assuming the regression remains live.

## Product Gaps
- There is still no dedicated campaign-level sequencing timeline across selected outputs.
- There is no usage/cost/admin console yet.

## Technical / Operational
- Campaign creation was moved off the server-action path and onto `POST /api/campaigns` so failures stay inline instead of spilling into the global error boundary.
- The repo now includes `apps/dashboard/scripts/provider-smoke.mjs` for repeatable live provider checks outside the signed-in UI flow.
- The read model can fall back to demo state too aggressively when live queries partially fail.
- The root package naming still says `ai-video-studio` even though the product brand is BrandBuild.
- Next.js currently warns about workspace-root inference because both the parent workspace and this repo contain lockfiles.
- Local runs require `apps/dashboard/.env.local`; without it, routes that instantiate the Supabase client can throw missing-env errors even though production is configured.
- The repo has pre-existing unrelated worktree changes outside the scope of the current stabilization work.
