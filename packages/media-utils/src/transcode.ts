import { buildPreviewTranscodeCommand } from "./ffmpeg";

export function planPreviewTranscode(inputPath: string, outputPath: string, width = 1280) {
  return {
    command: buildPreviewTranscodeCommand({ inputPath, outputPath, width }),
    outputPath,
  };
}
