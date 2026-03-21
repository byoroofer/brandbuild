import { jsonError, jsonOk } from "@/lib/account/http";
import { getAccountSnapshot, logoutAllUserSessions } from "@/lib/account/repository";
import {
  assertRecentReauthentication,
  assertSameOrigin,
  requireAccountRequestContext,
} from "@/lib/account/server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const snapshot = await getAccountSnapshot(context);

    assertRecentReauthentication(snapshot.preferences.lastReauthenticatedAt);
    await logoutAllUserSessions(context);

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

