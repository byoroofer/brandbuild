# BrandBuild Known Issues

## Active blockers
- Supabase Auth emails and redirects are not fully BrandBuild-native until the manual Send Email Hook, SMTP, and redirect settings are completed in the Supabase dashboard.
- Real provider success still needs to be validated end to end for Sora, Kling, and Higgsfield from signed-in dashboard sessions.

## Product gaps
- No dedicated compare outputs workspace yet.
- No version timeline or compare-set model yet.
- No edit handoff or export bundle layer yet.
- No usage/cost tracking surface yet.
- No admin/debug console yet.

## Technical weaknesses
- `apps/dashboard/lib/studio/repository.ts` currently falls back to demo mode if live queries fail or if there are no campaigns, which can hide partial production issues.
- Settings/control-center status is based on code and env readiness, not live runtime telemetry.
- Current upload limits are intentionally small for the first workflow pass: 10 MB images and 20 MB videos.

## UX friction
- The operator workflow is still strong at the shot level, but not yet strong enough across compare, version, and delivery stages.
- Project mental model is improving, but more of the app still needs to reinforce Projects -> Shots -> Runs -> Compare -> Handoff.
