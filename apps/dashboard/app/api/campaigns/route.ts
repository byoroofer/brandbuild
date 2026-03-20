import { NextResponse } from "next/server";

import { listCampaigns } from "@/lib/db/campaigns";

export async function GET() {
  const data = await listCampaigns();
  return NextResponse.json(data);
}
