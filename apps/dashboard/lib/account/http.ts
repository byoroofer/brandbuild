import { NextResponse } from "next/server";
import { z } from "zod";

import { AccountApiError } from "@/lib/account/server";

export async function parseJsonBody<T>(request: Request, schema: z.ZodType<T>) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    throw new AccountApiError(
      parsed.error.issues[0]?.message ?? "Invalid request payload.",
      400,
    );
  }

  return parsed.data;
}

export function jsonOk(payload: unknown, init?: ResponseInit) {
  return NextResponse.json(payload, init);
}

export function jsonError(error: unknown) {
  if (error instanceof AccountApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Invalid request payload." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: "Something went wrong while processing this request." },
    { status: 500 },
  );
}
