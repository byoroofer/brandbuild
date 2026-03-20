import { buildThumbnailCommand } from "./ffmpeg";

export function planThumbnailJob(inputPath: string, outputPath: string) {
  return {
    command: buildThumbnailCommand(inputPath, outputPath),
    outputPath,
  };
}
