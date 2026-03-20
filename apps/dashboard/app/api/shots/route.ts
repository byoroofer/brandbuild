import { NextResponse } from "next/server";

import { listShots } from "@/lib/db/shots";

export async function GET() {
  const data = await listShots();
  return NextResponse.json(data);
}
