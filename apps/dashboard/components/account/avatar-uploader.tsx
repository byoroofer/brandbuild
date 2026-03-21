"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

type AvatarUploaderProps = {
  avatarUrl: string | null;
  onChange: (next: { avatarPath: string | null; avatarUrl: string | null }) => void;
};

export function AvatarUploader({ avatarUrl, onChange }: AvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(avatarUrl);
  }, [avatarUrl]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/me/avatar", {
      body: formData,
      method: "POST",
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't upload that image.");
      setIsUploading(false);
      return;
    }

    setPreviewUrl(payload.avatarUrl ?? null);
    onChange({
      avatarPath: payload.avatarPath ?? null,
      avatarUrl: payload.avatarUrl ?? null,
    });
    setMessage("Avatar updated.");
    setIsUploading(false);
    event.target.value = "";
  }

  async function handleRemove() {
    setIsUploading(true);
    setMessage(null);

    const response = await fetch("/api/me/avatar", {
      method: "DELETE",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't remove that image.");
      setIsUploading(false);
      return;
    }

    setPreviewUrl(null);
    onChange({
      avatarPath: null,
      avatarUrl: null,
    });
    setMessage("Avatar removed.");
    setIsUploading(false);
  }

  return (
    <div className="rounded-[26px] border border-white/8 bg-black/20 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
          {previewUrl ? (
            <img
              alt="Current avatar preview"
              className="h-full w-full object-cover"
              src={previewUrl}
            />
          ) : (
            <span className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
              Avatar
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold text-white">Profile image</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Upload a JPG, PNG, or WebP image up to 5 MB. This deployment keeps
              account media private and resolves signed previews server-side.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="brandbuild-primary-button h-11 cursor-pointer px-4">
              {isUploading ? "Uploading..." : "Upload image"}
              <input
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileChange}
                type="file"
              />
            </label>

            <button
              className="brandbuild-secondary-button h-11 px-4"
              disabled={isUploading || !previewUrl}
              onClick={handleRemove}
              type="button"
            >
              Remove
            </button>
          </div>

          {message ? (
            <p aria-live="polite" className="text-sm text-slate-300">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
