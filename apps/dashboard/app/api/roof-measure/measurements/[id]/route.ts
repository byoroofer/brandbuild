import { NextResponse } from "next/server";

import { getMeasurementJobById } from "@/services/roof-measure/measurement/measurement-repository";

interface RoofMeasureDetailRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RoofMeasureDetailRouteContext) {
  const { id } = await context.params;
  const measurementJob = await getMeasurementJobById(id);

  if (!measurementJob) {
    return NextResponse.json({ error: "Measurement job not found." }, { status: 404 });
  }

  return NextResponse.json({ measurementJob });
}
