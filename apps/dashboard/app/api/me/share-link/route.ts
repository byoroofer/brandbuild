import { revalidatePath } from "next/cache";

import { jsonError, jsonOk } from "@/lib/account/http";
import { rotateShareLink } from "@/lib/account/repository";
import { assertSameOrigin, requireAccountRequestContext } from "@/lib/account/server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const result = await rotateShareLink(context);
    revalidatePath("/account/sharing");

    return jsonOk({
      shareSlug: result.share_slug,
      shareToken: result.share_token,
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

