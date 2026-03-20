export type MediaMetadata = {
  durationSeconds?: number;
  height?: number;
  mimeType?: string;
  width?: number;
};

export function normalizeMediaMetadata(metadata: MediaMetadata) {
  return {
    durationSeconds: metadata.durationSeconds ?? null,
    height: metadata.height ?? null,
    mimeType: metadata.mimeType ?? null,
    width: metadata.width ?? null,
  };
}
