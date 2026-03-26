# BrandBuild Integration Status
## Sora
- Adapter status: live-capable
- Current state: OpenAI-backed adapter exists and is wired into the shared generation pipeline. The 2026-03-25 provider smoke test successfully created a real queued Sora job: ideo_69c442cd810881939bdbe6afd2d428f80824e179028ff0fc.
- Still needed: run the signed-in dashboard path using the new hosted-reference or sample-import flow, then add cost/timing telemetry plus stronger refresh or webhook support.
- Reference handling: attached references now enrich `provider_prompt_text` at enqueue time, so Sora gets normalized visual guidance even before any future direct multimodal parameter wiring is verified.
## Kling
- Adapter status: live-capable
- Current state: JWT-signed adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with Account balance not enough.
- Still needed: fund or otherwise unblock the Kling account, then rerun the smoke test and validate a signed-in dashboard generation.
- Reference handling: attached references now enrich `provider_prompt_text` before Kling enqueue requests, while direct provider-native reference conditioning still remains a later documented enhancement.
## Higgsfield
- Adapter status: live-capable
- Current state: reference-image-led adapter exists and is wired into the shared generation pipeline, but the 2026-03-25 provider smoke test failed with Invalid credentials.
- Still needed: rotate or correct the Higgsfield credentials, then rerun the smoke test and validate a signed-in dashboard generation plus model-selection and refresh hardening.
## Shared Pipeline
- Working now: structured prompts, normalized generation persistence, status refresh, grouped compare outputs, asset-driven version groups and handoff packages, a repaired campaign-creation API path, a reusable provider smoke-test harness, hosted HTTPS reference linking, curated BrandBuild sample imports on shot detail, and reference-aware provider prompt augmentation for attached shot assets.
- Blocked now: the connected live Supabase project is still missing the BrandBuild schema, so `public.campaigns` and the rest of the app tables must be applied before live persistence works end to end.
- Setup hardening: empty but valid live datasets now remain in live mode, while missing-schema environments degrade into a clear setup state instead of surfacing raw PostgREST cache errors in the UI.
- Missing now: campaign-level sequencing, cost tracking, and richer admin/debug visibility.
## Auth / Trust Layer
- Code exists for branded auth emails through a Supabase Send Email Hook.
- Still needed: Supabase dashboard configuration, SMTP sender setup, and redirect cleanup so the email experience is fully BrandBuild-native.
## 2026-03-25 provider status update
- Sora: live create and completed content retrieval confirmed. BrandBuild now proxies completed media through /api/generate/[generationId]/content.
- Kling: adapter is live-capable but current account is blocked by insufficient balance.
- Higgsfield: adapter is live-capable but current credentials are invalid.
- References: operators can now use authenticated private uploads when storage rollout is done, or use hosted URLs and built-in BrandBuild samples immediately.
