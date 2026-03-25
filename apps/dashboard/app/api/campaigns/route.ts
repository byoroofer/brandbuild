import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { listCampaigns } from "@/lib/db/campaigns";
import { createAdminSupabaseClient, isSupabaseAdminAvailable } from "@/lib/supabase/admin";
import {
  assertStudioSameOrigin,
  requireStudioRequestContext,
  StudioApiError,
} from "@/lib/studio/server";
import { campaignCreateSchema } from "@/lib/studio/validation";
import type { Database } from "@/types/database";

function makeCampaignSlug(name: string, brandName: string) {
  const base = `${brandName} ${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);

  const suffix = randomUUID().slice(0, 8);
  return `${base || "campaign"}-${suffix}`;
}

export async function GET() {
  const data = await listCampaigns();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    assertStudioSameOrigin(request);
    const context = await requireStudioRequestContext();
    const json = await request.json().catch(() => null);
    const parsed = campaignCreateSchema.safeParse(json);

    if (!parsed.success) {
      throw new StudioApiError(
        parsed.error.issues[0]?.message ?? "Please complete the campaign fields.",
        400,
      );
    }

    const supabase = isSupabaseAdminAvailable()
      ? createAdminSupabaseClient()
      : context.supabase;

    const payload: Database["public"]["Tables"]["campaigns"]["Insert"] = {
      audience: parsed.data.audience,
      brand_name: parsed.data.brandName,
      call_to_action: parsed.data.callToAction,
      client_name: parsed.data.clientName,
      created_by: context.user.id,
      default_aspect_ratios: ["9:16", "1:1", "16:9"],
      name: parsed.data.name,
      objective: parsed.data.objective,
      offer: parsed.data.offer,
      slug: makeCampaignSlug(parsed.data.name, parsed.data.brandName),
      status: "draft",
      target_platforms: parsed.data.targetPlatforms,
    };

    const studioDb = supabase as any;
    const campaignsTable = studioDb.from("campaigns");
    const { data, error } = await campaignsTable.insert(payload).select("id").single();

    if (error || !data?.id) {
      throw new StudioApiError(error?.message ?? "Unable to create campaign.", 500);
    }

    await studioDb.from("activity_log").insert({
      action: "campaign_created",
      entity_id: data.id,
      entity_type: "campaign",
      payload: {
        campaign_name: parsed.data.name,
        created_by_user_id: context.user.id,
        target_platforms: parsed.data.targetPlatforms,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/campaigns");

    return NextResponse.json({
      campaignId: data.id,
      success: true,
    });
  } catch (error) {
    if (error instanceof StudioApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Something went wrong while creating the campaign." },
      { status: 500 },
    );
  }
}
