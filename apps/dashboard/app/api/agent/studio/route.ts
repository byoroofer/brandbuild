import { NextResponse } from "next/server";

import { getOptionalUser } from "@/lib/auth/session";
import { runStudioAgent } from "@/lib/agents/studio-agent";
import { studioAgentRequestSchema } from "@/lib/studio/validation";

export async function POST(request: Request) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "You must be signed in to use the studio agent.",
      },
      { status: 401 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON payload.",
      },
      { status: 400 },
    );
  }

  const parsed = studioAgentRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid studio agent request.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await runStudioAgent(parsed.data.query);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to run the studio agent.",
      },
      { status: 500 },
    );
  }
}
