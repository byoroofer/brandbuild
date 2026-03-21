import { revalidatePath } from "next/cache";

import { jsonError, jsonOk, parseJsonBody } from "@/lib/account/http";
import { updateAccountPreferences } from "@/lib/account/repository";
import { assertSameOrigin, requireAccountRequestContext } from "@/lib/account/server";
import { accountPreferencesPatchSchema } from "@/lib/account/validation";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const input = await parseJsonBody(request, accountPreferencesPatchSchema);

    await updateAccountPreferences(context, {
      ...input,
      lastReauthenticatedAt: null,
    });
    revalidatePath("/account/preferences");

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

