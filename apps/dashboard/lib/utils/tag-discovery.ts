import type { TagDiscoveryPlatform, TagDiscoveryTag } from "@/lib/studio/types";

const tagDiscoveryStartMarker = "[Tag Discovery]";
const tagDiscoveryEndMarker = "[/Tag Discovery]";
const promptSignalPrefix = "Creative market signal tags:";

type ParsedNotes = {
  freeformNotes: string;
  tags: TagDiscoveryTag[];
};

function sanitizeLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizePlatforms(value: string): TagDiscoveryPlatform[] {
  return value
    .split(",")
    .map((entry) => sanitizeLine(entry))
    .filter(Boolean) as TagDiscoveryPlatform[];
}

export function parseTagDiscoveryNotes(notes: string): ParsedNotes {
  const startIndex = notes.indexOf(tagDiscoveryStartMarker);
  const endIndex = notes.indexOf(tagDiscoveryEndMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return {
      freeformNotes: notes.trim(),
      tags: [],
    };
  }

  const before = notes.slice(0, startIndex).trim();
  const after = notes.slice(endIndex + tagDiscoveryEndMarker.length).trim();
  const block = notes
    .slice(startIndex + tagDiscoveryStartMarker.length, endIndex)
    .trim();

  const tags: TagDiscoveryTag[] = [];

  for (const line of block.split("\n").map((entry) => entry.trim())) {
    if (!line.startsWith("- ")) {
      continue;
    }

    const [labelPart, platformsPart, rationalePart] = line.slice(2).split(" | ");
    const label = sanitizeLine(labelPart ?? "");

    if (!label) {
      continue;
    }

    tags.push({
      label,
      platforms: normalizePlatforms(platformsPart ?? ""),
      rationale: sanitizeLine(rationalePart ?? "Operator-applied discovery tag."),
      trendSignal: "relevance_only",
    });
  }

  return {
    freeformNotes: [before, after].filter(Boolean).join("\n\n"),
    tags,
  };
}

export function mergeTagDiscoveryNotes(currentNotes: string, tags: TagDiscoveryTag[]) {
  const parsed = parseTagDiscoveryNotes(currentNotes);
  const normalizedTags = tags
    .map((tag) => ({
      ...tag,
      label: sanitizeLine(tag.label),
      platforms: tag.platforms.map((platform) => sanitizeLine(platform)) as TagDiscoveryPlatform[],
      rationale: sanitizeLine(tag.rationale),
    }))
    .filter((tag) => tag.label.length > 0);

  if (normalizedTags.length === 0) {
    return parsed.freeformNotes;
  }

  const lines = normalizedTags.map(
    (tag) => `- ${tag.label} | ${tag.platforms.join(", ")} | ${tag.rationale}`,
  );

  return [parsed.freeformNotes, tagDiscoveryStartMarker, ...lines, tagDiscoveryEndMarker]
    .filter(Boolean)
    .join("\n\n");
}

export function appendTagSignalsToPrompt(promptText: string, tags: TagDiscoveryTag[]) {
  const trimmedPrompt = promptText.trim();
  const baseLines = trimmedPrompt
    ? trimmedPrompt
        .split("\n")
        .filter((line) => !line.trim().startsWith(promptSignalPrefix))
    : [];

  if (tags.length === 0) {
    return baseLines.join("\n").trim();
  }

  const uniqueLabels = [...new Set(tags.map((tag) => sanitizeLine(tag.label)).filter(Boolean))];

  if (uniqueLabels.length === 0) {
    return baseLines.join("\n").trim();
  }

  return [...baseLines, `${promptSignalPrefix} ${uniqueLabels.join("; ")}.`]
    .join("\n")
    .trim();
}
