import { NextResponse } from "next/server";

import { listAssets } from "@/lib/db/assets";

export async function GET() {
  const data = await listAssets();
  return NextResponse.json(data);
}
