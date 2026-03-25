import type { AssetType, TargetModel } from "@/lib/studio/types";

export type StudioReferenceSample = {
  assetType: AssetType;
  description: string;
  fileName: string;
  fileUrl: string;
  helper: string;
  id: string;
  previewUrl: string;
  sourceLabel: string;
  tags: string[];
  targetModels: TargetModel[];
  title: string;
};

export const studioReferenceSamples: StudioReferenceSample[] = [
  {
    assetType: "product_image",
    description:
      "A dramatic premium packshot for beverage, beauty, or luxury CPG hero work.",
    fileName: "brandbuild-product-hero-reference.svg",
    fileUrl: "/reference-samples/product-hero.svg",
    helper: "Strong starting point for Sora product reveals and glossy studio composition.",
    id: "product-hero",
    previewUrl: "/reference-samples/product-hero.svg",
    sourceLabel: "BrandBuild sample library",
    tags: ["sample", "product", "studio-lighting", "premium"],
    targetModels: ["sora", "higgsfield"],
    title: "Premium product hero",
  },
  {
    assetType: "reference_image",
    description:
      "A rooftop lifestyle frame with warm light and an elevated aspirational mood.",
    fileName: "brandbuild-rooftop-lifestyle-reference.svg",
    fileUrl: "/reference-samples/rooftop-lifestyle.svg",
    helper: "Useful for social ad energy, human performance moments, and outdoor brand feel.",
    id: "rooftop-lifestyle",
    previewUrl: "/reference-samples/rooftop-lifestyle.svg",
    sourceLabel: "BrandBuild sample library",
    tags: ["sample", "lifestyle", "golden-hour", "social-ad"],
    targetModels: ["sora", "kling"],
    title: "Rooftop lifestyle",
  },
  {
    assetType: "character_sheet",
    description:
      "A neon editorial portrait frame to anchor recurring talent, identity, and styling consistency.",
    fileName: "brandbuild-neon-character-reference.svg",
    fileUrl: "/reference-samples/neon-character.svg",
    helper: "Good for character continuity and high-style experimental motion work.",
    id: "neon-character",
    previewUrl: "/reference-samples/neon-character.svg",
    sourceLabel: "BrandBuild sample library",
    tags: ["sample", "character", "editorial", "neon"],
    targetModels: ["higgsfield", "sora"],
    title: "Neon character frame",
  },
  {
    assetType: "moodboard",
    description:
      "A tonal collage of materials, interface shapes, and color language for look development.",
    fileName: "brandbuild-moodboard-reference.svg",
    fileUrl: "/reference-samples/moodboard-grid.svg",
    helper: "Use it when you need art direction, palette, and world-building cues.",
    id: "moodboard-grid",
    previewUrl: "/reference-samples/moodboard-grid.svg",
    sourceLabel: "BrandBuild sample library",
    tags: ["sample", "moodboard", "art-direction", "palette"],
    targetModels: ["sora", "kling", "higgsfield"],
    title: "Cinematic moodboard",
  },
  {
    assetType: "reference_video",
    description:
      "A public MP4 motion plate useful for timing, pacing, and camera-behavior references.",
    fileName: "brandbuild-motion-reference.mp4",
    fileUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    helper: "Best for Kling motion reference while private uploads are still being finished.",
    id: "motion-reference",
    previewUrl: "/reference-samples/motion-preview.svg",
    sourceLabel: "BrandBuild sample library",
    tags: ["sample", "motion", "camera", "timing"],
    targetModels: ["kling", "sora"],
    title: "Motion reference clip",
  },
];

export function getStudioReferenceSample(sampleId: string) {
  return studioReferenceSamples.find((sample) => sample.id === sampleId) ?? null;
}

export function resolveStudioReferenceSampleUrl(sample: StudioReferenceSample, appUrl: string) {
  if (/^https?:\/\//i.test(sample.fileUrl)) {
    return sample.fileUrl;
  }

  return new URL(sample.fileUrl, appUrl).toString();
}
