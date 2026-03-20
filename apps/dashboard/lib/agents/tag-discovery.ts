import "server-only";

import type {
  TagDiscoveryCitation,
  TagDiscoveryInputMode,
  TagDiscoveryPlatform,
  TagDiscoveryResult,
  TagDiscoveryTag,
  TagTrendSignal,
} from "@/lib/studio/types";

type DiscoverTagsInput = {
  audioFile?: File | null;
  platforms: TagDiscoveryPlatform[];
  query?: string | null;
};

type ParsedTagDiscoveryPayload = {
  freshnessLabel: string;
  summary: string;
  tags: Array<{
    label?: unknown;
    platforms?: unknown;
    rationale?: unknown;
    trendSignal?: unknown;
  }>;
};

const fallbackModel = "local-relevance-engine";
const defaultTagDiscoveryModel = "gpt-5-mini";
const defaultTranscriptionModel = "gpt-4o-mini-transcribe";

const tagPlatforms = [
  "instagram",
  "tiktok",
  "youtube-shorts",
  "meta-ads",
  "linkedin",
] as const satisfies ReadonlyArray<TagDiscoveryPlatform>;

const stopWords = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "be",
  "best",
  "better",
  "brand",
  "build",
  "campaign",
  "creative",
  "for",
  "from",
  "generate",
  "idea",
  "ideas",
  "in",
  "into",
  "marketing",
  "most",
  "new",
  "of",
  "on",
  "or",
  "our",
  "out",
  "related",
  "short",
  "shorts",
  "tag",
  "tags",
  "that",
  "the",
  "this",
  "to",
  "trending",
  "video",
  "videos",
  "with",
]);

function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY || process.env.SORA_API_KEY || "";
}

function hasOpenAiEnv() {
  return Boolean(getOpenAiApiKey());
}

function getTagDiscoveryModel() {
  return (process.env.OPENAI_TAG_DISCOVERY_MODEL ?? defaultTagDiscoveryModel).trim();
}

function getTranscriptionModel() {
  return (process.env.OPENAI_TRANSCRIBE_MODEL ?? defaultTranscriptionModel).trim();
}

function buildInputMode(query: string, transcript: string | null): TagDiscoveryInputMode {
  if (query && transcript) {
    return "hybrid";
  }

  if (transcript) {
    return "audio";
  }

  return "text";
}

function buildDiscoveryQuery(query: string, transcript: string | null) {
  return [query, transcript].filter((value): value is string => Boolean(value)).join("\n\n");
}

function humanizePlatform(platform: TagDiscoveryPlatform) {
  return platform.replaceAll("-", " ");
}

function normalizeTrendSignal(value: unknown): TagTrendSignal {
  return value === "high" || value === "medium" || value === "emerging"
    ? value
    : "relevance_only";
}

function normalizePlatforms(value: unknown, fallback: TagDiscoveryPlatform[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter(
      (entry): entry is TagDiscoveryPlatform =>
        typeof entry === "string" && tagPlatforms.includes(entry as TagDiscoveryPlatform),
    )
    .slice(0, 5);

  return normalized.length > 0 ? [...new Set(normalized)] : fallback;
}

function normalizeTagLabel(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.replace(/^#+/, "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTagRationale(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeTagSuggestions(
  value: ParsedTagDiscoveryPayload["tags"],
  fallbackPlatforms: TagDiscoveryPlatform[],
) {
  const suggestions: TagDiscoveryTag[] = [];
  const seen = new Set<string>();

  for (const candidate of value) {
    const label = normalizeTagLabel(candidate.label);

    if (!label) {
      continue;
    }

    const key = label.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    suggestions.push({
      label,
      platforms: normalizePlatforms(candidate.platforms, fallbackPlatforms),
      rationale: normalizeTagRationale(
        candidate.rationale,
        "Aligned to the operator brief and selected platforms.",
      ),
      trendSignal: normalizeTrendSignal(candidate.trendSignal),
    });
  }

  return suggestions.slice(0, 10);
}

function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Tag discovery response did not contain a JSON object.");
  }

  return candidate.slice(start, end + 1);
}

function extractCitation(annotation: unknown): TagDiscoveryCitation | null {
  if (!annotation || typeof annotation !== "object") {
    return null;
  }

  const direct =
    "type" in annotation && annotation.type === "url_citation"
      ? annotation
      : "url_citation" in annotation &&
          annotation.url_citation &&
          typeof annotation.url_citation === "object"
        ? annotation.url_citation
        : annotation;

  if (!direct || typeof direct !== "object") {
    return null;
  }

  const url = "url" in direct && typeof direct.url === "string" ? direct.url : null;

  if (!url) {
    return null;
  }

  const title =
    "title" in direct && typeof direct.title === "string" && direct.title.trim().length > 0
      ? direct.title.trim()
      : new URL(url).hostname.replace(/^www\./, "");

  return {
    title,
    url,
  };
}

function dedupeCitations(citations: TagDiscoveryCitation[]) {
  const unique = new Map<string, TagDiscoveryCitation>();

  for (const citation of citations) {
    if (!unique.has(citation.url)) {
      unique.set(citation.url, citation);
    }
  }

  return [...unique.values()].slice(0, 8);
}

function extractOutputTextAndCitations(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return {
      citations: [] as TagDiscoveryCitation[],
      outputText: null as string | null,
    };
  }

  const outputText =
    "output_text" in payload && typeof payload.output_text === "string"
      ? payload.output_text
      : null;

  const parts: string[] = outputText ? [outputText] : [];
  const citations: TagDiscoveryCitation[] = [];

  if ("output" in payload && Array.isArray(payload.output)) {
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
        } else if (
          "text" in content &&
          content.text &&
          typeof content.text === "object" &&
          "value" in content.text &&
          typeof content.text.value === "string"
        ) {
          parts.push(content.text.value);
        }

        const annotationGroups = [
          "annotations" in content && Array.isArray(content.annotations) ? content.annotations : [],
          "text" in content &&
          content.text &&
          typeof content.text === "object" &&
          "annotations" in content.text &&
          Array.isArray(content.text.annotations)
            ? content.text.annotations
            : [],
        ];

        for (const group of annotationGroups) {
          for (const annotation of group) {
            const citation = extractCitation(annotation);

            if (citation) {
              citations.push(citation);
            }
          }
        }
      }
    }
  }

  return {
    citations: dedupeCitations(citations),
    outputText: parts.join("\n").trim() || null,
  };
}

function parseOpenAiTagPayload(
  outputText: string,
  fallbackPlatforms: TagDiscoveryPlatform[],
) {
  const parsed = JSON.parse(extractJsonObject(outputText)) as ParsedTagDiscoveryPayload;
  const normalizedTags = normalizeTagSuggestions(parsed.tags ?? [], fallbackPlatforms);

  if (normalizedTags.length === 0) {
    throw new Error("Tag discovery did not return any usable tags.");
  }

  return {
    freshnessLabel:
      typeof parsed.freshnessLabel === "string" && parsed.freshnessLabel.trim().length > 0
        ? parsed.freshnessLabel.trim()
        : "Current web-backed signals",
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim().length > 0
        ? parsed.summary.trim()
        : "Current tag suggestions were generated from the operator brief and live web context.",
    tags: normalizedTags,
  };
}

function extractKeywords(query: string) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token))
    .slice(0, 8);
}

function pushFallbackTag(
  collection: TagDiscoveryTag[],
  label: string,
  rationale: string,
  platforms: TagDiscoveryPlatform[],
) {
  if (collection.some((item) => item.label.toLowerCase() === label.toLowerCase())) {
    return;
  }

  collection.push({
    label,
    platforms,
    rationale,
    trendSignal: "relevance_only",
  });
}

function buildFallbackTags(query: string, platforms: TagDiscoveryPlatform[]) {
  const tags: TagDiscoveryTag[] = [];
  const keywords = extractKeywords(query);
  const normalizedQuery = query.toLowerCase();

  const primaryPhrase = keywords.slice(0, 2).join(" ").trim();

  if (primaryPhrase) {
    pushFallbackTag(
      tags,
      primaryPhrase,
      "Direct phrase match from the operator brief.",
      platforms,
    );
  }

  if (normalizedQuery.match(/\blaunch|drop|announce|release\b/)) {
    pushFallbackTag(
      tags,
      "product launch",
      "Fits launch-style campaign language in the brief.",
      platforms,
    );
  }

  if (normalizedQuery.match(/\bpremium|luxury|hero|cinematic\b/)) {
    pushFallbackTag(
      tags,
      "cinematic hero",
      "Matches premium polish and hero-shot intent.",
      platforms,
    );
  }

  if (normalizedQuery.match(/\bugc|creator|testimonial|reaction|founder\b/)) {
    pushFallbackTag(
      tags,
      "creator-led proof",
      "Useful when the brief points toward people-first or trust-building creative.",
      platforms,
    );
  }

  if (normalizedQuery.match(/\bdemo|tutorial|feature|benefit|explain\b/)) {
    pushFallbackTag(
      tags,
      "product demo",
      "Aligned to feature-led or explanation-driven content.",
      platforms,
    );
  }

  if (normalizedQuery.match(/\blifestyle|day|morning|routine|rooftop|travel\b/)) {
    pushFallbackTag(
      tags,
      "lifestyle moment",
      "Supports aspirational context and human-use framing.",
      platforms,
    );
  }

  if (normalizedQuery.match(/\bdrink|beverage|coffee|tea|energy|snack|food\b/)) {
    pushFallbackTag(
      tags,
      "taste and texture",
      "Helpful for food-and-beverage creative that needs sensory cues.",
      platforms,
    );
  }

  if (normalizedQuery.match(/\bshop|offer|sale|discount|cta|conversion\b/)) {
    pushFallbackTag(
      tags,
      "performance creative",
      "Fits direct-response and call-to-action driven briefs.",
      platforms,
    );
  }

  if (normalizedQuery.match(/\bspring|summer|fall|autumn|winter|holiday|seasonal\b/)) {
    pushFallbackTag(
      tags,
      "seasonal creative",
      "Useful when the brief ties into a time-bound campaign moment.",
      platforms,
    );
  }

  if (platforms.includes("tiktok")) {
    pushFallbackTag(
      tags,
      "native tiktok hook",
      "A strong default when TikTok is part of the distribution mix.",
      ["tiktok"],
    );
  }

  if (platforms.includes("instagram")) {
    pushFallbackTag(
      tags,
      "premium reels aesthetic",
      "A strong fit for polished short-form Instagram creative.",
      ["instagram"],
    );
  }

  if (platforms.includes("youtube-shorts")) {
    pushFallbackTag(
      tags,
      "short-form vertical cut",
      "Useful when the brief needs retention-friendly YouTube Shorts framing.",
      ["youtube-shorts"],
    );
  }

  if (platforms.includes("meta-ads")) {
    pushFallbackTag(
      tags,
      "conversion-first framing",
      "Useful when paid Meta placements need clearer performance intent.",
      ["meta-ads"],
    );
  }

  if (platforms.includes("linkedin")) {
    pushFallbackTag(
      tags,
      "founder-led narrative",
      "Useful for more professional positioning and B2B-style storytelling.",
      ["linkedin"],
    );
  }

  if (tags.length === 0) {
    pushFallbackTag(
      tags,
      "scroll-stop opener",
      "A safe default when only a small amount of brief detail is available.",
      platforms,
    );
    pushFallbackTag(
      tags,
      "product hero",
      "Useful as a starting point for most short-form marketing videos.",
      platforms,
    );
  }

  return tags.slice(0, 8);
}

function buildFallbackResult(
  query: string,
  platforms: TagDiscoveryPlatform[],
  transcript: string | null,
  reason?: string,
): TagDiscoveryResult {
  const inputMode = buildInputMode(query, transcript);
  const note = reason ? ` ${reason}` : "";

  return {
    citations: [],
    freshnessLabel: "Relevance-only fallback",
    generatedAt: new Date().toISOString(),
    inputMode,
    model: fallbackModel,
    platforms,
    query: buildDiscoveryQuery(query, transcript),
    source: "fallback",
    summary: `Current web-backed tag search was not available, so these tags were derived from the brief and platform mix only.${note}`.trim(),
    tags: buildFallbackTags(buildDiscoveryQuery(query, transcript), platforms),
    transcript,
  };
}

async function transcribeAudio(audioFile: File) {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", getTranscriptionModel());

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    body: formData,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getOpenAiApiKey()}`,
    },
    method: "POST",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Audio transcription failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { text?: string };
  const transcript = typeof payload.text === "string" ? payload.text.trim() : "";

  if (!transcript) {
    throw new Error("Audio transcription returned an empty transcript.");
  }

  return transcript;
}

function buildSystemPrompt() {
  return [
    "You are the internal trend and tag strategist for AI Video Studio.",
    "Your job is to turn a short operator brief into the most relevant current tags and creative angles for short-form marketing video production.",
    "You must use live web search when available before answering.",
    "Be honest about freshness: only call something high-signal or emerging if current public web evidence supports it.",
    "Favor useful creative and distribution tags over novelty for its own sake.",
    "Keep tag labels concise, usually 2 to 4 words, and do not prefix them with #.",
    "Return JSON only with this exact shape:",
    "{",
    '  "freshnessLabel": string,',
    '  "summary": string,',
    '  "tags": [',
    "    {",
    '      "label": string,',
    '      "platforms": ["instagram" | "tiktok" | "youtube-shorts" | "meta-ads" | "linkedin"],',
    '      "trendSignal": "high" | "medium" | "emerging",',
    '      "rationale": string',
    "    }",
    "  ]",
    "}",
    "Return between 5 and 10 tags.",
    "Do not include markdown.",
  ].join("\n");
}

async function requestOpenAiTagDiscovery(
  query: string,
  platforms: TagDiscoveryPlatform[],
) {
  const model = getTagDiscoveryModel();
  const toolSets = [[{ type: "web_search_preview" }], [{ type: "web_search" }]];

  let lastError: Error | null = null;

  for (const tools of toolSets) {
    try {
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
                    `Date: ${new Date().toISOString().slice(0, 10)}`,
                    `Target platforms: ${platforms.map(humanizePlatform).join(", ")}`,
                    "",
                    "Operator brief:",
                    query,
                  ].join("\n"),
                  type: "input_text",
                },
              ],
              role: "user",
            },
          ],
          max_output_tokens: 900,
          model,
          tools,
        }),
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${getOpenAiApiKey()}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Tag discovery failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as unknown;
      const { citations, outputText } = extractOutputTextAndCitations(payload);

      if (!outputText) {
        throw new Error("Tag discovery did not return readable text output.");
      }

      const parsed = parseOpenAiTagPayload(outputText, platforms);

      return {
        citations,
        freshnessLabel: parsed.freshnessLabel,
        generatedAt: new Date().toISOString(),
        model,
        summary: parsed.summary,
        tags: parsed.tags,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Tag discovery failed.");
    }
  }

  throw lastError ?? new Error("Tag discovery failed.");
}

export async function discoverTags({
  audioFile,
  platforms,
  query,
}: DiscoverTagsInput): Promise<TagDiscoveryResult> {
  const trimmedQuery = query?.trim() ?? "";
  let transcript: string | null = null;

  if (audioFile && audioFile.size > 0) {
    if (!hasOpenAiEnv()) {
      if (!trimmedQuery) {
        throw new Error(
          "Voice tag discovery needs OPENAI_API_KEY so the audio note can be transcribed.",
        );
      }
    } else {
      transcript = await transcribeAudio(audioFile);
    }
  }

  const discoveryQuery = buildDiscoveryQuery(trimmedQuery, transcript);

  if (!discoveryQuery) {
    throw new Error("Enter a few keywords or record a short voice note.");
  }

  const inputMode = buildInputMode(trimmedQuery, transcript);

  if (!hasOpenAiEnv()) {
    return buildFallbackResult(
      trimmedQuery,
      platforms,
      transcript,
      "Set OPENAI_API_KEY to enable live web-backed trend signals and voice transcription.",
    );
  }

  try {
    const liveResult = await requestOpenAiTagDiscovery(discoveryQuery, platforms);

    return {
      citations: liveResult.citations,
      freshnessLabel:
        liveResult.citations.length > 0
          ? liveResult.freshnessLabel
          : "Live model scan with limited citations",
      generatedAt: liveResult.generatedAt,
      inputMode,
      model: liveResult.model,
      platforms,
      query: discoveryQuery,
      source: "openai-web-search",
      summary: liveResult.summary,
      tags: liveResult.tags,
      transcript,
    };
  } catch (error) {
    return buildFallbackResult(
      trimmedQuery,
      platforms,
      transcript,
      error instanceof Error ? error.message : "Live trend discovery failed.",
    );
  }
}
