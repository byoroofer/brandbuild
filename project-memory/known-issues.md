# BrandBuild Known Issues

## Critical / Active
- Supabase Auth dashboard setup is still incomplete, so branded auth emails and clean BrandBuild-native magic-link behavior are not fully live yet.
- Live provider integrations for Sora, Kling, and Higgsfield are code-wired but not fully validated with confirmed operator runs.
- Auth callback and session-cookie failures should now recover safely, but the live auth trust layer still needs the Supabase dashboard setup finished so the full login flow feels native and reliable.

## Product Gaps
- There is still no dedicated campaign-level sequencing timeline across selected outputs.
- There is no usage/cost/admin console yet.

## Technical / Operational
- The read model can fall back to demo state too aggressively when live queries partially fail.
- The root package naming still says `ai-video-studio` even though the product brand is BrandBuild.
- Next.js currently warns about workspace-root inference because both the parent workspace and this repo contain lockfiles.
- Local runs require `apps/dashboard/.env.local`; without it, routes that instantiate the Supabase client can throw missing-env errors even though production is configured.
- The repo has pre-existing unrelated worktree changes outside the scope of the current stabilization work.
