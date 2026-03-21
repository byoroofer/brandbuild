import "server-only";

import type { ProviderCatalogItem } from "@/lib/studio/providers/types";

function hasOpenAiSoraCredentials() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.SORA_API_KEY);
}

function hasKlingCredentials() {
  return Boolean(process.env.KLING_API_KEY && process.env.KLING_API_SECRET);
}

function hasHiggsfieldCredentials() {
  const combined =
    process.env.HF_KEY?.trim() ??
    process.env.HIGGSFIELD_KEY?.trim() ??
    (process.env.HIGGSFIELD_API_KEY?.includes(":")
      ? process.env.HIGGSFIELD_API_KEY.trim()
      : null);

  if (combined && combined.includes(":")) {
    return true;
  }

  return Boolean(
    (process.env.HIGGSFIELD_API_KEY || process.env.HF_API_KEY) &&
      (process.env.HIGGSFIELD_API_SECRET || process.env.HF_API_SECRET),
  );
}

const providerCatalog: Record<ProviderCatalogItem["id"], ProviderCatalogItem> = {
  sora: {
    capabilities: ["premium-cinematic", "hero-polish"],
    configured: hasOpenAiSoraCredentials(),
    description:
      "Best for polished cinematic hero shots, brand-finish visuals, and premium launch moments.",
    fitSummary: "Use when realism, composition, and premium finish matter most.",
    id: "sora",
    integrationStage: "live",
    label: "OpenAI Sora 2",
  },
  kling: {
    capabilities: ["controlled-motion", "character-performance", "lip-sync-friendly"],
    configured: hasKlingCredentials(),
    description:
      "Best for controlled motion, character-driven scenes, dialogue beats, and action-friendly ads.",
    fitSummary:
      "Use when the shot needs readable motion, talent performance, or social-native pacing.",
    id: "kling",
    integrationStage: "live",
    label: "Kling",
  },
  higgsfield: {
    capabilities: ["experimental-worldbuilding", "premium-cinematic"],
    configured: hasHiggsfieldCredentials(),
    description:
      "Best for exploratory cinematic concepts, surreal worldbuilding, and broader creative exploration.",
    fitSummary:
      "Use when the brief benefits from experimentation before locking a production-safe path.",
    id: "higgsfield",
    integrationStage: "live",
    label: "Higgsfield",
  },
};

export function getProviderCatalogItem(id: keyof typeof providerCatalog) {
  return providerCatalog[id];
}

export function listProviderCatalog() {
  return Object.values(providerCatalog);
}
