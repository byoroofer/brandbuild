import { NextResponse } from "next/server";

import { discoverTags } from "@/lib/agents/tag-discovery";
import { getOptionalUser } from "@/lib/auth/session";
import { normalizeOptionalString } from "@/lib/utils";
import {
  maxTagDiscoveryAudioBytes,
  tagDiscoveryAudioExtensions,
  tagDiscoveryAudioMimeTypes,
  tagDiscoveryRequestSchema,
} from "@/lib/studio/validation";

export const runtime = "nodejs";

function isAllowedAudioFile(file: File) {
  const normalizedType = file.type.toLowerCase();

  if (
    tagDiscoveryAudioMimeTypes.some((mimeType) => mimeType === normalizedType)
  ) {
    return true;
  }

  const normalizedName = file.name.toLowerCase();
  return tagDiscoveryAudioExtensions.some((extension) => normalizedName.endsWith(extension));
}

export async function POST(request: Request) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "You must be signed in to generate current tags.",
      },
      { status: 401 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid form submission.",
      },
      { status: 400 },
    );
  }

  const query = normalizeOptionalString(formData.get("query")) ?? "";
  const platforms = formData
    .getAll("platforms")
    .filter((value): value is string => typeof value === "string");
  const audioEntry = formData.get("audio");
  const audioFile = audioEntry instanceof File && audioEntry.size > 0 ? audioEntry : null;

  const parsed = tagDiscoveryRequestSchema.safeParse({
    platforms,
    query,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid tag discovery request.",
      },
      { status: 400 },
    );
  }

  if (!parsed.data.query && !audioFile) {
    return NextResponse.json(
      {
        error: "Enter a few keywords or record a short voice note.",
      },
      { status: 400 },
    );
  }

  if (audioFile) {
    if (audioFile.size > maxTagDiscoveryAudioBytes) {
      return NextResponse.json(
        {
          error: "Voice notes must be 8 MB or smaller.",
        },
        { status: 400 },
      );
    }

    if (!isAllowedAudioFile(audioFile)) {
      return NextResponse.json(
        {
          error: "Use a webm, mp3, mp4, wav, m4a, or ogg voice note.",
        },
        { status: 400 },
      );
    }
  }

  try {
    const result = await discoverTags({
      audioFile,
      platforms: parsed.data.platforms,
      query: parsed.data.query,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to generate current tags.",
      },
      { status: 500 },
    );
  }
}
