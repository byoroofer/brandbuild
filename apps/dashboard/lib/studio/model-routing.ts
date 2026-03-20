import type { RoutingRecommendation, Shot } from "@/lib/studio/types";

function containsAny(value: string, keywords: string[]) {
  const lowered = value.toLowerCase();
  return keywords.some((keyword) => lowered.includes(keyword));
}

export function getRoutingRecommendation(shot: Shot): RoutingRecommendation {
  const signal = `${shot.title} ${shot.purpose} ${shot.notes} ${shot.promptText}`.toLowerCase();

  if (
    containsAny(signal, ["hero", "premium", "polished", "launch", "realism", "brand film"])
  ) {
    return {
      fitSummary: "Best fit for cinematic hero work and premium polish.",
      model: "sora",
      rationale:
        "This shot reads like a premium brand-film moment where realism, composition, and polished finish matter most.",
    };
  }

  if (
    containsAny(signal, ["character", "dialogue", "lip-sync", "action", "social", "talent"])
  ) {
    return {
      fitSummary: "Best fit for controlled motion and character performance.",
      model: "kling",
      rationale:
        "This shot depends on readable motion, talent performance, or social-native pacing, which makes Kling the strongest default route.",
    };
  }

  return {
    fitSummary: "Best fit for exploratory cinematic experimentation.",
    model: "higgsfield",
    rationale:
      "This shot looks better suited to concept exploration, worldbuilding, or creative testing before production-safe lockup.",
  };
}
