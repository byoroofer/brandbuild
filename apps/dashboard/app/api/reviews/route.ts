import { NextResponse } from "next/server";

import { getReviewsSummary } from "@/lib/db/reviews";

export async function GET() {
  const data = await getReviewsSummary();
  return NextResponse.json(data);
}
