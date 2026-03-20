export function buildPrivateAssetPath(campaignId: string, fileName: string, shotId?: string | null) {
  if (shotId) {
    return `campaigns/${campaignId}/shots/${shotId}/${fileName}`;
  }

  return `campaigns/${campaignId}/shared/${fileName}`;
}

export function buildGeneratedAssetStoragePath(input: {
  campaignId: string;
  fileName: string;
  generationId: string;
  shotId?: string | null;
}) {
  const scopedFileName = `generations/${input.generationId}/${input.fileName}`;
  return buildPrivateAssetPath(input.campaignId, scopedFileName, input.shotId);
}

export function createStoragePointer(bucket: string, objectPath: string) {
  return `storage://${bucket}/${objectPath}`;
}

export function parseStoragePointer(fileUrl: string) {
  if (!fileUrl.startsWith("storage://")) {
    return null;
  }

  const withoutScheme = fileUrl.slice("storage://".length);
  const firstSlashIndex = withoutScheme.indexOf("/");

  if (firstSlashIndex === -1) {
    return null;
  }

  const bucket = withoutScheme.slice(0, firstSlashIndex);
  const objectPath = withoutScheme.slice(firstSlashIndex + 1);

  if (!bucket || !objectPath) {
    return null;
  }

  return {
    bucket,
    objectPath,
  };
}
