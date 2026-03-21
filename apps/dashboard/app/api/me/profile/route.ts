import { revalidatePath } from "next/cache";

import { parseJsonBody, jsonError, jsonOk } from "@/lib/account/http";
import { getAccountSnapshot, updateAccountProfile } from "@/lib/account/repository";
import {
  assertRecentReauthentication,
  assertSameOrigin,
  requireAccountRequestContext,
} from "@/lib/account/server";
import { accountProfilePatchSchema } from "@/lib/account/validation";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const snapshot = await getAccountSnapshot(context);
    const input = await parseJsonBody(request, accountProfilePatchSchema);

    if (input.authEmail || input.newPassword) {
      assertRecentReauthentication(snapshot.preferences.lastReauthenticatedAt);
    }

    await updateAccountProfile(context, input);
    revalidatePath("/account");
    revalidatePath("/account/profile");
    revalidatePath("/account/security");

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}
