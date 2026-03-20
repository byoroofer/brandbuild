import { NextResponse } from "next/server";

import { geocodeRequestSchema } from "@/lib/validations/roof-measure";
import { geocodeAddress } from "@/services/roof-measure/geocode";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsedPayload = geocodeRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: "Invalid geocode request.",
          issues: parsedPayload.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await geocodeAddress(parsedPayload.data.address);
    return NextResponse.json({ address: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to geocode the provided address.";

    return NextResponse.json(
      { error: message },
      {
        status: message.includes("not configured") ? 503 : 500,
      },
    );
  }
}
