# BrandBuild Integration Status

## Sora
- Adapter status: live-capable
- Current state: OpenAI-backed adapter exists and is wired into the shared generation pipeline. The 2026-03-25 provider smoke test successfully created a real queued Sora job: `video_69c442cd810881939bdbe6afd2d428f80824e179028ff0fc`.
- Still needed: poll that job through completion, then validate the same path from a signed-in dashboard session and add cost/timing telemetry plus stronger refresh or webhook support.

## Kling
- Adapter status: live-capable
- Current state: JWT-signed adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with `Account balance not enough`.
- Still needed: fund or otherwise unblock the Kling account, then rerun the smoke test and validate a signed-in dashboard generation.

## Higgsfield
- Adapter status: live-capable
- Current state: reference-image-led adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with `Invalid credentials`.
- Still needed: rotate or correct the Higgsfield credentials, then rerun the smoke test and validate a signed-in dashboard generation plus model-selection and refresh hardening.

## Shared Pipeline
- Working now: structured prompts, normalized generation persistence, status refresh, a grouped compare-outputs workspace, asset-driven version groups and handoff packages, a repaired campaign-creation API path, and a reusable provider smoke-test harness.
- Blocked now: private uploads are blocked on the live deployment until `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Missing now: campaign-level sequencing, cost tracking, and richer admin/debug visibility.

## Auth / Trust Layer
- Code exists for branded auth emails through a Supabase Send Email Hook.
- Still needed: Supabase dashboard configuration, SMTP sender setup, and redirect cleanup so the email experience is fully BrandBuild-native.
