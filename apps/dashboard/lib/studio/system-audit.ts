import "server-only";

import { isSupabaseAdminAvailable } from "@/lib/supabase/admin";
import { hasStudioPersistenceEnv } from "@/lib/db/client";
import { listProviderCatalog } from "@/lib/studio/providers";

type AuditStatus = "working" | "partial" | "missing" | "blocked";
type ProviderReadiness =
  | "validated"
  | "live-configured"
  | "live-capable"
  | "awaiting-credentials";

export type AuditChecklistItem = {
  id: string;
  notes: string[];
  status: AuditStatus;
  title: string;
};

export type ProviderAudit = {
  asyncHandling: string;
  authMethod: string;
  bestUseCases: string[];
  configured: boolean;
  currentState: string;
  docsUrl: string;
  id: "sora" | "kling" | "higgsfield";
  inputFormat: string;
  label: string;
  limitations: string[];
  mediaStorage: string;
  nextSteps: string[];
  outputFormat: string;
  rateLimitNotes: string;
  readiness: ProviderReadiness;
  webhookStatus: string;
};

export type ArchitecturePillar = {
  nextMove: string;
  state: "implemented" | "partial" | "missing";
  summary: string;
  title: string;
};

export type StudioSystemAudit = {
  architecture: ArchitecturePillar[];
  exactImplementationOrder: string[];
  generatedAt: string;
  missing: AuditChecklistItem[];
  partial: AuditChecklistItem[];
  providerAudits: ProviderAudit[];
  uiUxRecommendations: string[];
  working: AuditChecklistItem[];
};

function buildReadiness(configured: boolean): ProviderReadiness {
  return configured ? "live-capable" : "awaiting-credentials";
}

function buildCurrentState(
  configured: boolean,
  configuredSummary: string,
  missingSummary: string,
) {
  return configured ? configuredSummary : missingSummary;
}

export function getStudioSystemAudit(): StudioSystemAudit {
  const providerCatalog = listProviderCatalog();
  const providerById = Object.fromEntries(providerCatalog.map((provider) => [provider.id, provider]));
  const storageMirroringEnabled = isSupabaseAdminAvailable();
  const persistenceEnabled = hasStudioPersistenceEnv();
  const storageUploadEnabled = persistenceEnabled;
  const timestamp = new Date().toISOString();

  const providerAudits: ProviderAudit[] = [
    {
      asyncHandling:
        "POST /v1/videos creates a job and the workspace refreshes status through GET /v1/videos/{video_id}.",
      authMethod: "Bearer OPENAI_API_KEY",
      bestUseCases: [
        "Premium hero shots",
        "Polished cinematic launch visuals",
        "Brand-safe realism and finish",
      ],
      configured: providerById.sora?.configured ?? false,
      currentState: buildCurrentState(
        providerById.sora?.configured ?? false,
        "Live-capable adapter is wired in the app. The remaining unknown is provider-side Sora entitlement and real operator validation.",
        "Adapter is wired, but OpenAI credentials are missing from this environment.",
      ),
      docsUrl: "https://developers.openai.com/api/docs/guides/video-generation",
      id: "sora",
      inputFormat:
        "Prompt-first video generation. Current workspace normalizes to 16:9 or 9:16 and 4s/8s/12s durations.",
      label: "OpenAI Sora 2",
      limitations: [
        "Current workspace blocks 1:1 Sora runs.",
        "No webhook route yet; status refresh is still manual from the shot workspace.",
        "Cost and token usage are not persisted yet.",
      ],
      mediaStorage: storageMirroringEnabled
        ? "Successful provider outputs can be mirrored into Supabase Storage through the existing asset sync path."
        : "Outputs can still stream through BrandBuild, but storage mirroring stays disabled until SUPABASE_SERVICE_ROLE_KEY is present.",
      nextSteps: [
        "Run a real signed-in Sora shot from the dashboard and capture the success path.",
        "Add background polling or webhook-driven refresh for completed renders.",
        "Persist cost metadata and provider timing metrics.",
      ],
      outputFormat:
        "Video id, status, progress, output URL, and poster frame URL are normalized into shot_generations and assets.",
      rateLimitNotes:
        "OpenAI-side rate limits are not yet surfaced in the UI; failures currently come back as provider errors only.",
      readiness: buildReadiness(providerById.sora?.configured ?? false),
      webhookStatus: "Not implemented in the app yet.",
    },
    {
      asyncHandling:
        "Create task through Kling video generation endpoint, then refresh by polling the task status endpoint.",
      authMethod: "JWT signed from KLING_API_KEY + KLING_API_SECRET",
      bestUseCases: [
        "Controlled character motion",
        "Dialogue and lip-sync friendly shots",
        "Readable action-driven social content",
      ],
      configured: providerById.kling?.configured ?? false,
      currentState: buildCurrentState(
        providerById.kling?.configured ?? false,
        "Live-capable adapter is wired with JWT auth and status refresh. It still needs real production runs validated against the active Kling account.",
        "Adapter is wired, but Kling credentials are missing from this environment.",
      ),
      docsUrl: "https://docs.qingque.cn/d/home/eZQDkhg4h2Qg8SEVSUTBdzYeY?identityId=2Cn18n4EIHT",
      id: "kling",
      inputFormat:
        "Current path is text-to-video with normalized aspect ratio, duration, mode, and sound controls.",
      label: "Kling",
      limitations: [
        "Current workspace only wires the text-to-video path, not broader image/video remix modes.",
        "Webhook ingestion is not implemented yet.",
        "Rate-limit, quota, and billing telemetry are not surfaced yet.",
      ],
      mediaStorage: storageMirroringEnabled
        ? "Successful outputs can sync into Supabase asset records and mirror to storage."
        : "Outputs stay on provider URLs until storage mirroring is configured.",
      nextSteps: [
        "Validate one live Kling job end to end from a signed-in dashboard session.",
        "Add webhook or background refresh support for faster operator feedback.",
        "Expand the adapter beyond text-to-video into advanced motion/reference workflows.",
      ],
      outputFormat:
        "Task id, provider status, output URL, and thumbnail are normalized into shot_generations and assets.",
      rateLimitNotes:
        "Kling SLA/rate behavior is not modeled yet; the app currently relies on provider error responses.",
      readiness: buildReadiness(providerById.kling?.configured ?? false),
      webhookStatus: "Planned but not implemented.",
    },
    {
      asyncHandling:
        "Submit a model request to Higgsfield and refresh through requests/{request_id}/status. The API also supports an hf_webhook parameter for future use.",
      authMethod: "Authorization: Key HIGGSFIELD_API_KEY:HIGGSFIELD_API_SECRET",
      bestUseCases: [
        "Exploratory cinematic passes",
        "Worldbuilding and concept exploration",
        "Reference-led image-to-video experimentation",
      ],
      configured: providerById.higgsfield?.configured ?? false,
      currentState: buildCurrentState(
        providerById.higgsfield?.configured ?? false,
        "Live-capable adapter is wired and production credentials can be used. The default model still needs real reference-image validation inside the app.",
        "Adapter is wired, but Higgsfield credentials are missing from this environment.",
      ),
      docsUrl: "https://docs.higgsfield.ai/guides/video",
      id: "higgsfield",
      inputFormat:
        "Current default model is image-to-video, so the workspace expects a reference image on the shot unless the model id changes.",
      label: "Higgsfield",
      limitations: [
        "Default model path is image-led, not prompt-only.",
        "No webhook route exists yet even though the adapter supports passing hf_webhook.",
        "Model catalog selection is still env-driven instead of managed in product UI.",
      ],
      mediaStorage: storageMirroringEnabled
        ? "Successful outputs can sync into private asset rows and mirror to storage."
        : "Outputs remain provider-hosted until storage mirroring is available.",
      nextSteps: [
        "Validate one live Higgsfield request using a real uploaded reference image.",
        "Add a product UI for model selection and reference requirements.",
        "Implement webhook ingestion or background refresh to remove manual polling friction.",
      ],
      outputFormat:
        "Request id, status, video URL, and still image URLs are normalized into shot_generations and assets.",
      rateLimitNotes:
        "Quota, credits, and rate-limit handling are not yet surfaced in the operator workspace.",
      readiness: buildReadiness(providerById.higgsfield?.configured ?? false),
      webhookStatus: "Supported by provider, not yet wired in BrandBuild.",
    },
  ];

  return {
    architecture: [
      {
        nextMove: "Keep campaigns as the project spine, but formalize version/run group concepts on top of them.",
        state: "partial",
        summary:
          "Campaigns, scenes, and shots already exist, but there is no first-class compare set or version group above individual runs.",
        title: "Projects and shot planning",
      },
      {
        nextMove:
          "Keep uploads on authenticated private storage, then layer server-side mirroring on top for provider-owned outputs.",
        state: "partial",
        summary:
          "Private uploads, generated outputs, version groups, and handoff packages exist. Uploads can run through authenticated storage policies, while provider-output mirroring still depends on server-side storage credentials.",
        title: "Assets and storage",
      },
      {
        nextMove:
          "Insert a normalized orchestration layer for retries, grouped runs, provider timings, and webhook ingestion.",
        state: "partial",
        summary:
          "The provider abstraction is solid, but orchestration still runs through direct route handlers instead of a fuller job system.",
        title: "Job orchestration",
      },
      {
        nextMove:
          "Refine the compare workspace with clearer selection-to-handoff transitions and eventual run-group context.",
        state: "implemented",
        summary:
          "Operators now have a dedicated compare-outputs workspace on /dashboard/reviews, grouped by shot with provider context and media previews.",
        title: "Comparison and selects",
      },
      {
        nextMove:
          "Add campaign-level sequencing, ordered selects, and richer export packaging on top of the existing handoff layer.",
        state: "partial",
        summary:
          "BrandBuild already derives version groups and campaign handoff packages on /dashboard/assets, but there is no sequencing timeline or final delivery state model yet.",
        title: "Versions and handoff",
      },
      {
        nextMove:
          "Track per-run usage, provider cost estimates, error codes, and admin-visible raw payload inspection.",
        state: "missing",
        summary:
          "The product does not yet expose cost tracking, rate-limit visibility, or an admin/debug console.",
        title: "Observability and cost",
      },
    ],
    exactImplementationOrder: [
      "1. Finish auth/email/dashboard environment hardening so operators can log in cleanly and trust the product surface.",
      "2. Keep the provider abstraction, but add a visible connections and readiness layer for operators and admins, including storage/upload blockers.",
      "3. Promote shot_generations into a fuller orchestration model with retries, grouped runs, and webhook-aware status handling.",
      "4. Add campaign-level sequencing on top of the shipped compare and handoff surfaces.",
      "5. Deepen the version and edit handoff layer rather than building a full browser editor first.",
      "6. Add usage, cost, and admin/debug visibility after the happy-path workflow is stable.",
    ],
    generatedAt: timestamp,
    missing: [
      {
        id: "campaign-sequencing",
        notes: [
          "There is still no timeline or ordered-select workspace for arranging chosen outputs across a campaign.",
          "Editors can receive grouped handoff packages, but they cannot yet see or adjust the intended shot order inside the product.",
        ],
        status: "missing",
        title: "Campaign sequencing timeline",
      },
      {
        id: "delivery-state",
        notes: [
          "BrandBuild can prepare handoff packages, but it does not yet track final export state, delivered cut versions, or editor-complete milestones.",
          "There is no final delivery checklist beyond the current selected-output and review signals.",
        ],
        status: "missing",
        title: "Delivery state and export lifecycle",
      },
      {
        id: "usage-admin",
        notes: [
          "Provider usage, cost estimates, and admin/raw debug views are not yet exposed.",
          "No webhook event inspection or provider failure analytics exist in-product.",
        ],
        status: "missing",
        title: "Usage, cost, and admin visibility",
      },
    ],
    partial: [
      {
        id: "private-upload-storage",
        notes: [
          storageUploadEnabled
            ? "Authenticated operators can use private storage when the assets bucket and policies are applied."
            : "This deployment is missing Supabase persistence configuration, so private uploads cannot initialize.",
          storageMirroringEnabled
            ? "Server-side storage credentials are present, so provider-owned outputs can also be mirrored into storage."
            : "Generated outputs can still stream through BrandBuild, but server-side mirroring remains unavailable until SUPABASE_SERVICE_ROLE_KEY is present.",
        ],
        status: storageUploadEnabled ? "partial" : "blocked",
        title: "Private upload and storage readiness",
      },
      {
        id: "auth-email",
        notes: [
          "Branded auth email code exists, but Supabase dashboard hook/SMTP configuration is still a manual blocker.",
          "Until that is finished, users may still see default Supabase-looking auth behavior.",
        ],
        status: "blocked",
        title: "Auth branding and trust layer",
      },
      {
        id: "provider-validation",
        notes: [
          "All three provider adapters are wired and credentials can be present, but real signed-in dashboard validation is still pending.",
          "The current UI is good at launching runs, but not yet at explaining why a provider succeeded or failed.",
        ],
        status: "partial",
        title: "Live provider validation",
      },
      {
        id: "workflow-ux",
        notes: [
          "Guided workflow exists on the dashboard and shot pages, but the product still expects too much operator intuition.",
          "Projects, generate, compare, versions, export, and connections are still not clear enough as top-level workspaces.",
        ],
        status: "partial",
        title: "Unified operator workflow",
      },
    ],
    providerAudits,
    uiUxRecommendations: [
      "Promote Campaigns to Projects in the primary navigation so the mental model matches the product goal.",
      "Add a visible Connections/Settings control center so provider readiness is not hidden inside cards or code.",
      "Build Compare, Versions, and Export as first-class surfaces instead of asking operators to infer them from shot detail.",
      "Keep the cinematic dark system, but tighten hierarchy so each page has one obvious next action and one clear decision lane.",
      "Make provider requirements explicit in-context, especially for Higgsfield reference-image flows and Sora aspect-ratio limits.",
    ],
    working: [
      {
        id: "dashboard-foundation",
        notes: [
          "The app has a polished dashboard shell, guided workflow widgets, shot queue, campaign pages, assets, reviews, and account settings.",
          "The design system is cohesive and already looks more premium than a typical internal tool.",
        ],
        status: "working",
        title: "Core operator workspace",
      },
      {
        id: "prompt-routing",
        notes: [
          "Shot detail includes structured prompt building, routing recommendation, provider launch, and generation history.",
          "The provider interface is already normalized behind one adapter contract.",
        ],
        status: "working",
        title: "Prompt and routing workflow",
      },
      {
        id: "compare-outputs",
        notes: [
          "The reviews surface now acts as a compare-outputs workspace grouped by shot.",
          "Candidates carry provider, generation, campaign, review, and media-preview context without schema drift.",
        ],
        status: "working",
        title: "Compare outputs workspace",
      },
      {
        id: "assets-upload",
        notes: [
          storageUploadEnabled
            ? "Private shot asset upload and signed operator-side asset URLs are implemented through the authenticated Supabase client."
            : "The upload route and signed-url logic exist, but Supabase persistence is not configured enough for uploads to initialize.",
          storageMirroringEnabled
            ? "Successful provider outputs can also mirror into storage."
            : "Successful provider outputs still remain provider-hosted until server-side mirroring is configured.",
          "BrandBuild also has a shipped assets workspace for library browsing, version review, and handoff preparation.",
        ],
        status: storageUploadEnabled ? "working" : "partial",
        title: "Asset and handoff foundation",
      },
    ],
  };
}
