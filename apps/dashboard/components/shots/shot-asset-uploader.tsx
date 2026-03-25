"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AssetType, TargetModel } from "@/lib/studio/types";
import { cx } from "@/lib/utils";

type ShotAssetUploaderProps = {
  shotId: string;
  targetModel: TargetModel;
  uploadBlockedReason: string | null;
  uploadEnabled: boolean;
};

const assetTypeOptions: Array<{
  accept: string;
  helper: string;
  label: string;
  value: AssetType;
}> = [
  {
    accept: "image/jpeg,image/png,image/webp",
    helper: "Best for product stills, moodboards, and Higgsfield image-led motion studies.",
    label: "Reference image",
    value: "reference_image",
  },
  {
    accept: "video/mp4,video/quicktime,video/webm",
    helper: "Use for motion reference, timing, camera behavior, or edit direction.",
    label: "Reference video",
    value: "reference_video",
  },
  {
    accept: "image/jpeg,image/png,image/webp",
    helper: "Product packshots or ecommerce stills that should stay visually consistent.",
    label: "Product image",
    value: "product_image",
  },
  {
    accept: "image/jpeg,image/png,image/webp",
    helper: "Character consistency references for recurring talent or generated personas.",
    label: "Character sheet",
    value: "character_sheet",
  },
  {
    accept: "image/jpeg,image/png,image/webp",
    helper: "Color, styling, lighting, or visual-world references for the shot.",
    label: "Moodboard",
    value: "moodboard",
  },
  {
    accept: "image/jpeg,image/png,image/webp",
    helper: "Brand marks and locked visual identifiers for overlays or framing reference.",
    label: "Logo",
    value: "logo",
  },
];

function getDefaultAssetType(targetModel: TargetModel): AssetType {
  if (targetModel === "higgsfield") {
    return "reference_image";
  }

  if (targetModel === "kling") {
    return "reference_video";
  }

  return "reference_image";
}

export function ShotAssetUploader({
  shotId,
  targetModel,
  uploadBlockedReason,
  uploadEnabled,
}: ShotAssetUploaderProps) {
  const router = useRouter();
  const [assetType, setAssetType] = useState<AssetType>(getDefaultAssetType(targetModel));
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedType = useMemo(
    () => assetTypeOptions.find((option) => option.value === assetType) ?? assetTypeOptions[0],
    [assetType],
  );

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!uploadEnabled) {
      setMessage(
        uploadBlockedReason ??
          "Private uploads are not available on this deployment yet.",
      );
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("assetType", assetType);
      formData.append("file", file);

      const response = await fetch(`/api/shots/${shotId}/assets`, {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            asset?: { fileName?: string | null };
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "We couldn't upload that reference.");
      }

      setMessage(
        `Uploaded ${payload?.asset?.fileName ?? file.name}. The shot workspace is refreshing with the new reference.`,
      );
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "We couldn't upload that reference.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="rounded-[28px] border border-white/8 bg-black/16 p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
            Upload references
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Add private shot assets before you generate
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Upload a reference image, motion clip, product still, or moodboard directly into this
            shot. Files stay private in storage and the generation pipeline can reuse them on the
            next run.
          </p>
        </div>

        <div className="rounded-full border border-cyan-400/16 bg-cyan-400/10 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-cyan-50 uppercase">
          {targetModel === "higgsfield"
            ? "Higgsfield works best with a reference image"
            : targetModel === "kling"
              ? "Kling benefits from motion reference"
              : "Sora gains polish from strong visual references"}
        </div>
      </div>

      {!uploadEnabled ? (
        <div className="mt-5 rounded-[24px] border border-amber-300/18 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-50">
          {uploadBlockedReason ??
            "Private uploads are not available on this deployment yet."}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3 md:grid-cols-2">
          {assetTypeOptions.map((option) => (
            <button
              className={cx(
                "rounded-[24px] border p-4 text-left transition",
                option.value === assetType
                  ? "border-cyan-400/28 bg-cyan-400/10"
                  : "border-white/8 bg-white/4 hover:border-white/16 hover:bg-white/6",
              )}
              key={option.value}
              onClick={() => setAssetType(option.value)}
              type="button"
            >
              <p className="text-sm font-semibold text-white">{option.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{option.helper}</p>
            </button>
          ))}
        </div>

        <div className="rounded-[26px] border border-white/8 bg-black/18 p-5">
          <p className="text-sm font-semibold text-white">{selectedType.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{selectedType.helper}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {uploadEnabled
              ? "Images: JPG, PNG, WebP up to 10 MB. Videos: MP4, MOV, WebM up to 20 MB."
              : uploadBlockedReason ??
                "Private uploads are not available on this deployment yet."}
          </p>

          <label
            className={cx(
              "brandbuild-primary-button mt-5 h-11 w-full cursor-pointer px-4",
              !uploadEnabled || isUploading ? "pointer-events-none opacity-60" : "",
            )}
          >
            {isUploading
              ? "Uploading..."
              : uploadEnabled
                ? `Upload ${selectedType.label.toLowerCase()}`
                : "Uploads unavailable"}
            <input
              accept={selectedType.accept}
              className="hidden"
              disabled={!uploadEnabled || isUploading}
              onChange={handleFileChange}
              type="file"
            />
          </label>

          {message ? (
            <p aria-live="polite" className="mt-4 text-sm leading-6 text-slate-300">
              {message}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              The uploader attaches assets directly to this shot so they appear in the asset panel
              and can feed the provider router immediately.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
