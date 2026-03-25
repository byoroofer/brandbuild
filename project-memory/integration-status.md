# BrandBuild Integration Status

## Sora
- Adapter status: live-capable
- Current state: OpenAI-backed adapter exists and is wired into the shared generation pipeline.
- Still needed: one confirmed real dashboard run, then cost/timing telemetry and stronger refresh or webhook support.

## Kling
- Adapter status: live-capable
- Current state: JWT-signed adapter exists and is wired into the shared generation pipeline.
- Still needed: one confirmed real dashboard run and broader async/job-state validation.

## Higgsfield
- Adapter status: live-capable
- Current state: reference-image-led adapter exists and is wired into the shared generation pipeline.
- Still needed: one confirmed real dashboard run plus model-selection and refresh hardening.

## Shared Pipeline
- Working now: structured prompts, private reference uploads, normalized generation persistence, status refresh, and asset sync for successful runs.
- Missing now: compare outputs, version groups, edit handoff/export, cost tracking, and richer admin/debug visibility.

## Auth / Trust Layer
- Code exists for branded auth emails through a Supabase Send Email Hook.
- Still needed: Supabase dashboard configuration, SMTP sender setup, and redirect cleanup so the email experience is fully BrandBuild-native.
