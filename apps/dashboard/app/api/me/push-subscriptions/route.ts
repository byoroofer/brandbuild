import { jsonError, jsonOk, parseJsonBody } from "@/lib/account/http";
import { createOrUpdatePushSubscription } from "@/lib/account/repository";
import { assertSameOrigin, requireAccountRequestContext } from "@/lib/account/server";
import { accountPushSubscriptionSchema } from "@/lib/account/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const input = await parseJsonBody(request, accountPushSubscriptionSchema);

    await createOrUpdatePushSubscription(context, input);

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

