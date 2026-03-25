# BrandBuild Known Issues

## Critical / Active
- Supabase Auth dashboard setup is still incomplete, so branded auth emails and clean BrandBuild-native magic-link behavior are not fully live yet.
- Live provider integrations for Sora, Kling, and Higgsfield are code-wired but not fully validated with confirmed operator runs.

## Product Gaps
- There is no first-class compare outputs workspace yet.
- There is no version timeline or edit handoff/export bundle layer yet.
- There is no usage/cost/admin console yet.

## Technical / Operational
- The read model can fall back to demo state too aggressively when live queries partially fail.
- The root package naming still says `ai-video-studio` even though the product brand is BrandBuild.
- Next.js currently warns about workspace-root inference because both the parent workspace and this repo contain lockfiles.
- The marketing root still logs a non-fatal Dynamic server usage warning during build because session-aware code can touch cookies while `/` is being evaluated.
- Local runs require `apps/dashboard/.env.local`; without it, routes that instantiate the Supabase client can throw missing-env errors even though production is configured.
- The repo has pre-existing unrelated worktree changes outside the scope of the current stabilization work.
