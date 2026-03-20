import "server-only";

import { listProviderCatalog } from "@/lib/studio/providers";
import { getDashboardHomeData, listCampaigns, listShots } from "@/lib/studio/repository";
import type { TargetModel } from "@/lib/studio/types";

type StudioAgentSource = "openai" | "fallback";

export type StudioAgentReply = {
  model: string;
  operatorNotes: string[];
  promptPatch: string[];
  recommendedActions: string[];
  routingDecision: TargetModel | null;
  source: StudioAgentSource;
  summary: string;
  title: string;
};

type WorkspaceSnapshot = {
  campaigns: Array<{
    clientName: string;
    name: string;
    platforms: string[];
    status: string;
  }>;
  mode: string;
  providers: Array<{
    configured: boolean;
    fitSummary: string;
    id: string;
    integrationStage: string;
    label: string;
  }>;
  shots: Array<{
    campaignName: string;
    durationSeconds: number;
    purpose: string;
    status: string;
    targetModel: string;
    title: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
  }>;
};

function hasStudioAgentEnv() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.SORA_API_KEY);
}

function getStudioAgentModel() {
  return (process.env.OPENAI_STUDIO_AGENT_MODEL ?? "gpt-5.1-codex").trim();
}

function buildSystemPrompt() {
  return [
    "You are Studio Agent for AI Video Studio, an internal operator dashboard for AI marketing video production.",
    "You help with campaign planning, shot routing, prompt refinement, generation sequencing, and review prioritization.",
    "You must stay grounded in the workspace data provided.",
    "Do not claim that Kling or Higgsfield are live if the workspace context says they are still stubbed.",
    "Prefer concise, production-minded guidance.",
    "Return JSON only with this exact shape:",
    '{',
    '  "title": string,',
    '  "summary": string,',
    '  "routingDecision": "sora" | "kling" | "higgsfield" | null,',
    '  "recommendedActions": string[],',
    '  "promptPatch": string[],',
    '  "operatorNotes": string[]',
    '}',
    "Keep each array between 1 and 5 items.",
    "Prompt patches should be short, concrete fragments or rewrites an operator can apply immediately.",
  ].join("\n");
}

function extractOutputText(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    if ("output_text" in payload && typeof payload.output_text === "string") {
      return payload.output_text;
    }

    if ("output" in payload && Array.isArray(payload.output)) {
      const parts: string[] = [];

      for (const item of payload.output) {
        if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
          continue;
        }

        for (const content of item.content) {
          if (!content || typeof content !== "object") {
            continue;
          }

          if ("text" in content && typeof content.text === "string") {
            parts.push(content.text);
            continue;
          }

          if (
            "text" in content &&
            content.text &&
            typeof content.text === "object" &&
            "value" in content.text &&
            typeof content.text.value === "string"
          ) {
            parts.push(content.text.value);
          }
        }
      }

      if (parts.length > 0) {
        return parts.join("\n").trim();
      }
    }
  }

  return null;
}

function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Studio agent response did not contain a JSON object.");
  }

  return candidate.slice(start, end + 1);
}

function parseRoutingDecision(value: unknown): TargetModel | null {
  return value === "sora" || value === "kling" || value === "higgsfield" ? value : null;
}

function normalizeStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .slice(0, 5);

  return normalized.length > 0 ? normalized : fallback;
}

function parseStudioAgentReply(payloadText: string, model: string): StudioAgentReply {
  const parsed = JSON.parse(extractJsonObject(payloadText)) as Record<string, unknown>;

  return {
    model,
    operatorNotes: normalizeStringArray(parsed.operatorNotes, [
      "Review the current shot queue before triggering the next run.",
    ]),
    promptPatch: normalizeStringArray(parsed.promptPatch, [
      "Tighten subject clarity, motion intent, and composition before the next render.",
    ]),
    recommendedActions: normalizeStringArray(parsed.recommendedActions, [
      "Refine the prompt structure and confirm the target model before generating.",
    ]),
    routingDecision: parseRoutingDecision(parsed.routingDecision),
    source: "openai",
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim().length > 0
        ? parsed.summary.trim()
        : "Studio agent returned guidance, but the summary was empty.",
    title:
      typeof parsed.title === "string" && parsed.title.trim().length > 0
        ? parsed.title.trim()
        : "Studio guidance",
  };
}

function inferRoutingDecision(query: string): TargetModel {
  const normalized = query.toLowerCase();

  if (
    normalized.includes("character") ||
    normalized.includes("lip sync") ||
    normalized.includes("dialogue") ||
    normalized.includes("motion")
  ) {
    return "kling";
  }

  if (
    normalized.includes("experimental") ||
    normalized.includes("explore") ||
    normalized.includes("worldbuild") ||
    normalized.includes("surreal")
  ) {
    return "higgsfield";
  }

  return "sora";
}

function buildFallbackReply(query: string, snapshot: WorkspaceSnapshot, reason?: string): StudioAgentReply {
  const routingDecision = inferRoutingDecision(query);
  const liveProvider = snapshot.providers.find((provider) => provider.integrationStage === "live");
  const nextShot = snapshot.shots.find((shot) => shot.status === "prompt_ready") ?? snapshot.shots[0];

  return {
    model: reason ? "local-fallback" : getStudioAgentModel(),
    operatorNotes: [
      liveProvider
        ? `${liveProvider.label} is the only live provider path in the current workspace.`
        : "No live provider path is currently marked as ready.",
      nextShot
        ? `A good next operator target is ${nextShot.title} in ${nextShot.campaignName}.`
        : "Load campaign and shot data before asking for execution advice.",
      ...(reason ? [reason] : []),
    ].slice(0, 5),
    promptPatch: [
      "Clarify the hero subject and the exact action in the first sentence.",
      "State camera motion explicitly instead of implying it.",
      "Keep constraints focused on label fidelity, anatomy, and editability.",
    ],
    recommendedActions: [
      "Confirm the best-fit provider before generating.",
      "Tighten the prompt builder fields before recording another run.",
      "Review the latest generation status and queue only the next high-value shot.",
    ],
    routingDecision,
    source: "fallback",
    summary:
      snapshot.mode === "live"
        ? "Fallback guidance is active. The studio agent can still give grounded operator advice from live workspace data."
        : "Fallback guidance is active in demo mode. The studio agent is using local workspace context until a live OpenAI agent response is available.",
    title: "Studio operator guidance",
  };
}

async function buildWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  const [dashboard, campaigns, shots] = await Promise.all([
    getDashboardHomeData(),
    listCampaigns(),
    listShots(),
  ]);
  const providers = listProviderCatalog();

  return {
    campaigns: campaigns.campaigns.slice(0, 6).map((campaign) => ({
      clientName: campaign.clientName,
      name: campaign.name,
      platforms: campaign.targetPlatforms,
      status: campaign.status,
    })),
    mode: dashboard.mode,
    providers: providers.map((provider) => ({
      configured: provider.configured,
      fitSummary: provider.fitSummary,
      id: provider.id,
      integrationStage: provider.integrationStage,
      label: provider.label,
    })),
    shots: shots.shots.slice(0, 12).map((shot) => ({
      campaignName: shot.campaignName,
      durationSeconds: shot.durationSeconds,
      purpose: shot.purpose,
      status: shot.status,
      targetModel: shot.targetModel,
      title: shot.title,
    })),
    stats: dashboard.stats.map((stat) => ({
      label: stat.label,
      value: stat.value,
    })),
  };
}

async function requestOpenAiReply(query: string, snapshot: WorkspaceSnapshot) {
  const model = getStudioAgentModel();
  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [
        {
          content: [
            {
              text: buildSystemPrompt(),
              type: "input_text",
            },
          ],
          role: "system",
        },
        {
          content: [
            {
              text: [
                `Operator request:\n${query}`,
                "",
                "Workspace snapshot:",
                JSON.stringify(snapshot, null, 2),
              ].join("\n"),
              type: "input_text",
            },
          ],
          role: "user",
        },
      ],
      model,
    }),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY || process.env.SORA_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Studio agent request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as unknown;
  const outputText = extractOutputText(payload);

  if (!outputText) {
    throw new Error("Studio agent did not return readable text output.");
  }

  return parseStudioAgentReply(outputText, model);
}

export async function runStudioAgent(query: string): Promise<StudioAgentReply> {
  const snapshot = await buildWorkspaceSnapshot();

  if (!hasStudioAgentEnv()) {
    return buildFallbackReply(query, snapshot, "Set OPENAI_API_KEY to enable the live Studio Agent.");
  }

  try {
    return await requestOpenAiReply(query, snapshot);
  } catch (error) {
    return buildFallbackReply(
      query,
      snapshot,
      error instanceof Error ? error.message : "Studio agent fell back to local guidance.",
    );
  }
}
