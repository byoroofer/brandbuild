# BrandBuild Integration Status

## Sora
- Status: live-capable in product, not yet fully validated end to end
- Auth: `OPENAI_API_KEY`
- Current input model: prompt-first video generation
- Current async handling: create video, then refresh status manually from the shot workspace
- What works now:
  - shared adapter
  - generation request persistence
  - status refresh route
  - asset sync path for successful outputs
- What is still needed:
  - one confirmed real signed-in run
  - webhook or background polling support
  - cost/timing telemetry
- Docs:
  - [OpenAI video generation guide](https://developers.openai.com/api/docs/guides/video-generation)
  - [OpenAI Videos API reference](https://developers.openai.com/api/reference/resources/videos)

## Kling
- Status: live-capable in product, not yet fully validated end to end
- Auth: JWT signed from `KLING_API_KEY` and `KLING_API_SECRET`
- Current input model: text-to-video path
- Current async handling: task creation plus status polling
- What works now:
  - shared adapter
  - JWT auth path
  - status refresh route
  - output/thumbnail normalization
- What is still needed:
  - one confirmed real signed-in run
  - broader mode coverage beyond the current text-to-video path
  - webhook or background refresh support
  - cost/rate visibility
- Docs:
  - [Kling API spec](https://docs.qingque.cn/d/home/eZQDkhg4h2Qg8SEVSUTBdzYeY?identityId=2Cn18n4EIHT)

## Higgsfield
- Status: live-capable in product, not yet fully validated end to end
- Auth: `Authorization: Key HIGGSFIELD_API_KEY:HIGGSFIELD_API_SECRET`
- Current input model: default reference-image-led model
- Current async handling: request submission plus `requests/{request_id}/status` polling
- What works now:
  - shared adapter
  - status refresh route
  - asset sync path
  - private shot upload flow for reference images
- What is still needed:
  - one confirmed real signed-in run with a reference image
  - model-selection UI
  - webhook support
  - cost/rate visibility
- Docs:
  - [Higgsfield video docs](https://docs.higgsfield.ai/guides/video)
  - [Higgsfield API introduction](https://docs.higgsfield.ai/how-to/introduction)
  - [Higgsfield webhook docs](https://docs.higgsfield.ai/how-to/webhooks)

## Shared product integration gaps
- Compare outputs workspace
- Version groups / timeline
- Edit handoff and export bundles
- Usage and cost tracking
- Admin/debug visibility
