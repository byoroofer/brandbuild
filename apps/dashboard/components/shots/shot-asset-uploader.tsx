"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { studioReferenceSamples } from "@/lib/studio/reference-samples";
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
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [hostedUrl, setHostedUrl] = useState("");
  const [hostedUrlLabel, setHostedUrlLabel] = useState("");
  const [isLinkingUrl, setIsLinkingUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedType = useMemo(
    () => assetTypeOptions.find((option) => option.value === assetType) ?? assetTypeOptions[0],
    [assetType],
  );

  const recommendedSamples = useMemo(() => {
    return [...studioReferenceSamples].sort((left, right) => {
      const leftScore =
        Number(left.assetType === assetType) * 4 +
        Number(left.targetModels.includes(targetModel)) * 2 +
        Number(left.assetType === getDefaultAssetType(targetModel));
      const rightScore =
        Number(right.assetType === assetType) * 4 +
        Number(right.targetModels.includes(targetModel)) * 2 +
        Number(right.assetType === getDefaultAssetType(targetModel));

      return rightScore - leftScore;
    });
  }, [assetType, targetModel]);

  async function refreshWithMessage(nextMessage: string) {
    setMessage(nextMessage);
    router.refresh();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!uploadEnabled) {
      setMessage(
        uploadBlockedReason ??
          "Private uploads are not available on this deployment yet, but you can still attach a hosted URL or import a sample reference below.",
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

      await refreshWithMessage(
        `Uploaded ${payload?.asset?.fileName ?? file.name}. The shot workspace is refreshing with the new reference.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "We couldn't upload that reference.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleHostedReferenceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hostedUrl.trim()) {
      setMessage("Paste a hosted HTTPS media URL first.");
      return;
    }

    setIsLinkingUrl(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/shots/${shotId}/assets`, {
        body: JSON.stringify({
          assetType,
          fileName: hostedUrlLabel.trim() || undefined,
          fileUrl: hostedUrl.trim(),
          mode: "external_url",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            asset?: { fileName?: string | null };
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "We couldn't attach that hosted reference.");
      }

      setHostedUrl("");
      setHostedUrlLabel("");
      await refreshWithMessage(
        `Attached ${payload?.asset?.fileName ?? "the hosted reference"}. It is now available to the provider router on the next run.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't attach that hosted reference.",
      );
    } finally {
      setIsLinkingUrl(false);
    }
  }

  async function handleImportSample(sampleId: string) {
    setActiveSampleId(sampleId);
    setMessage(null);

    try {
      const response = await fetch(`/api/shots/${shotId}/assets`, {
        body: JSON.stringify({
          mode: "sample_reference",
          sampleId,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            asset?: { fileName?: string | null };
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "We couldn't import that sample reference.");
      }

      await refreshWithMessage(
        `Imported ${payload?.asset?.fileName ?? "the sample reference"}. The shot workspace is refreshing with the new starting asset.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't import that sample reference.",
      );
    } finally {
      setActiveSampleId(null);
    }
  }

  return (
    <div className="rounded-[28px] border border-white/8 bg-black/16 p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
            References
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Feed the shot workspace however your team is ready
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Upload privately when storage is ready, attach a hosted asset URL right now, or import
            a BrandBuild reference sample to keep moving. Every path lands in the same shot asset
            panel and flows through the same provider router.
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

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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

      {!uploadEnabled ? (
        <div className="mt-5 rounded-[24px] border border-amber-300/18 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-50">
          {uploadBlockedReason ??
            "Private uploads are not available on this deployment yet, but the hosted-reference and sample-library paths below still work."}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_340px]">
        <div className="grid gap-4">
          <div className="rounded-[26px] border border-white/8 bg-black/18 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Quick-start sample references</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Import a curated BrandBuild sample asset instantly. This is the fastest path when
                  you want to test orchestration, prompt routing, or generation without waiting on
                  private storage setup.
                </p>
              </div>
              <div className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-slate-300 uppercase">
                No upload required
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {recommendedSamples.map((sample) => {
                const matchesSelectedType = sample.assetType === assetType;
                const matchesTargetModel = sample.targetModels.includes(targetModel);

                return (
                  <div
                    className={cx(
                      "rounded-[24px] border p-4 transition",
                      matchesSelectedType || matchesTargetModel
                        ? "border-cyan-400/20 bg-cyan-400/8"
                        : "border-white/8 bg-white/4",
                    )}
                    key={sample.id}
                  >
                    <div className="overflow-hidden rounded-[18px] border border-white/8 bg-black/30">
                      <img
                        alt={sample.title}
                        className="h-40 w-full object-cover"
                        src={sample.previewUrl}
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{sample.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{sample.description}</p>
                      </div>
                      <span className="rounded-full border border-white/8 bg-white/6 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-slate-300 uppercase">
                        {sample.assetType.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{sample.helper}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {sample.targetModels.map((model) => (
                        <span
                          className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-slate-300 uppercase"
                          key={model}
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                    <button
                      className={cx(
                        "brandbuild-primary-button mt-5 h-11 w-full px-4",
                        activeSampleId === sample.id ? "pointer-events-none opacity-60" : "",
                      )}
                      onClick={() => handleImportSample(sample.id)}
                      type="button"
                    >
                      {activeSampleId === sample.id ? "Importing..." : "Import sample"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <form
            className="rounded-[26px] border border-white/8 bg-black/18 p-5"
            onSubmit={handleHostedReferenceSubmit}
          >
            <p className="text-sm font-semibold text-white">Attach a hosted reference URL</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Paste any HTTPS image or public media URL. BrandBuild will track it as a shot-linked
              external reference and pass it into the next generation request without requiring a
              private upload first.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm text-slate-300">
                  <span className="font-medium text-white">Hosted media URL</span>
                  <input
                    className="h-12 rounded-[18px] border border-white/10 bg-black/28 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                    onChange={(event) => setHostedUrl(event.target.value)}
                    placeholder="https://example.com/reference.mp4"
                    type="url"
                    value={hostedUrl}
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  <span className="font-medium text-white">Optional label</span>
                  <input
                    className="h-12 rounded-[18px] border border-white/10 bg-black/28 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                    onChange={(event) => setHostedUrlLabel(event.target.value)}
                    placeholder="Premium rooftop motion plate"
                    type="text"
                    value={hostedUrlLabel}
                  />
                </label>
              </div>

              <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-semibold text-white">{selectedType.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{selectedType.helper}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Use HTTPS-only media URLs so providers can fetch the reference reliably.
                </p>
                <button
                  className={cx(
                    "brandbuild-primary-button mt-5 h-11 w-full px-4",
                    isLinkingUrl ? "pointer-events-none opacity-60" : "",
                  )}
                  type="submit"
                >
                  {isLinkingUrl ? "Attaching..." : "Attach hosted reference"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="rounded-[26px] border border-white/8 bg-black/18 p-5">
          <p className="text-sm font-semibold text-white">Private upload</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{selectedType.helper}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {uploadEnabled
              ? "Images: JPG, PNG, WebP up to 10 MB. Videos: MP4, MOV, WebM up to 20 MB."
              : uploadBlockedReason ??
                "Private uploads are not available on this deployment yet."}
          </p>

          <label
            className={cx(
              "brandbuild-primary-button mt-5 flex h-11 w-full cursor-pointer items-center justify-center px-4",
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

          <div className="mt-5 rounded-[20px] border border-white/8 bg-white/4 p-4">
            <p className="text-sm font-semibold text-white">Why three input paths?</p>
            <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-400">
              <p>Upload privately when you need locked-down operator storage.</p>
              <p>Attach a hosted URL when the source already lives somewhere public.</p>
              <p>Import a sample when you want to test routing and generation immediately.</p>
            </div>
          </div>

          {message ? (
            <p aria-live="polite" className="mt-4 text-sm leading-6 text-slate-300">
              {message}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Every method attaches assets directly to this shot so they appear in the asset panel
              and can feed the provider router immediately.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
