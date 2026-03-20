export type VideoVariantOptions = {
  inputPath: string;
  outputPath: string;
  width: number;
};

export function buildThumbnailCommand(inputPath: string, outputPath: string) {
  return `ffmpeg -y -i "${inputPath}" -vf "thumbnail,scale=1280:-1" -frames:v 1 "${outputPath}"`;
}

export function buildPreviewTranscodeCommand({
  inputPath,
  outputPath,
  width,
}: VideoVariantOptions) {
  return `ffmpeg -y -i "${inputPath}" -vf "scale=${width}:-2" -c:v libx264 -preset fast -crf 23 -movflags +faststart "${outputPath}"`;
}

export function buildConcatCommand(manifestPath: string, outputPath: string) {
  return `ffmpeg -y -f concat -safe 0 -i "${manifestPath}" -c copy "${outputPath}"`;
}
