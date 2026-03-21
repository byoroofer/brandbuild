import { jsonError, jsonOk } from "@/lib/account/http";
import { logoutCurrentUser } from "@/lib/account/repository";
import { assertSameOrigin, requireAccountRequestContext } from "@/lib/account/server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    await logoutCurrentUser(context);

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

