import { NextResponse } from "next/server";

import { saveMeasurementRequestSchema } from "@/lib/validations/roof-measure";
import { saveMeasurementJob } from "@/services/roof-measure/measurement/measurement-repository";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsedPayload = saveMeasurementRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: "Invalid measurement payload.",
          issues: parsedPayload.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await saveMeasurementJob(parsedPayload.data);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save the measurement job.";

    return NextResponse.json(
      { error: message },
      {
        status: message.includes("not configured") ? 503 : 500,
      },
    );
  }
}
