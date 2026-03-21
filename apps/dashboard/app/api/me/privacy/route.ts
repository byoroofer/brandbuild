import { revalidatePath } from "next/cache";

import { jsonError, jsonOk, parseJsonBody } from "@/lib/account/http";
import { updatePrivacyControls } from "@/lib/account/repository";
import { assertSameOrigin, requireAccountRequestContext } from "@/lib/account/server";
import { accountPrivacyPatchSchema } from "@/lib/account/validation";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const input = await parseJsonBody(request, accountPrivacyPatchSchema);

    await updatePrivacyControls(context, input);
    revalidatePath("/account/privacy");
    revalidatePath("/account/sharing");

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

