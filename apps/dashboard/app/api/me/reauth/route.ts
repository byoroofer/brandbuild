import { jsonError, jsonOk, parseJsonBody } from "@/lib/account/http";
import { markRecentReauthentication } from "@/lib/account/repository";
import {
  assertSameOrigin,
  requireAccountRequestContext,
  verifyPasswordForCurrentUser,
} from "@/lib/account/server";
import { accountReauthSchema } from "@/lib/account/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const input = await parseJsonBody(request, accountReauthSchema);

    await verifyPasswordForCurrentUser(context.user.id, context.user.email ?? null, input.password);
    const timestamp = await markRecentReauthentication(context);

    return jsonOk({
      message: "Verification complete for sensitive account actions.",
      timestamp,
    });
  } catch (error) {
    return jsonError(error);
  }
}

