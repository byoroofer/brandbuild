# BrandBuild Integration Status
## Sora
- Adapter status: live-capable
- Current state: OpenAI-backed adapter exists and is wired into the shared generation pipeline. The 2026-03-25 provider smoke test successfully created a real queued Sora job: ideo_69c442cd810881939bdbe6afd2d428f80824e179028ff0fc.
- Still needed: run the signed-in dashboard path using the new hosted-reference or sample-import flow, then add cost/timing telemetry plus stronger refresh or webhook support.
## Kling
- Adapter status: live-capable
- Current state: JWT-signed adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with Account balance not enough.
- Still needed: fund or otherwise unblock the Kling account, then rerun the smoke test and validate a signed-in dashboard generation.
## Higgsfield
- Adapter status: live-capable
- Current state: reference-image-led adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with Invalid credentials.
- Still needed: rotate or correct the Higgsfield credentials, then rerun the smoke test and validate a signed-in dashboard generation plus model-selection and refresh hardening.
## Shared Pipeline
- Working now: structured prompts, normalized generation persistence, status refresh, grouped compare outputs, asset-driven version groups and handoff packages, a repaired campaign-creation API path, a reusable provider smoke-test harness, hosted HTTPS reference linking, and curated BrandBuild sample imports on shot detail.
- Blocked now: authenticated private uploads still need the Supabase assets bucket and storage policies applied on the live project.
- Missing now: campaign-level sequencing, cost tracking, and richer admin/debug visibility.
## Auth / Trust Layer
- Code exists for branded auth emails through a Supabase Send Email Hook.
- Still needed: Supabase dashboard configuration, SMTP sender setup, and redirect cleanup so the email experience is fully BrandBuild-native.
## 2026-03-25 provider status update
- Sora: live create and completed content retrieval confirmed. BrandBuild now proxies completed media through /api/generate/[generationId]/content.
- Kling: adapter is live-capable but current account is blocked by insufficient balance.
- Higgsfield: adapter is live-capable but current credentials are invalid.
- References: operators can now use authenticated private uploads when storage rollout is done, or use hosted URLs and built-in BrandBuild samples immediately.
