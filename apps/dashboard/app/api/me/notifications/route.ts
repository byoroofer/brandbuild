import { revalidatePath } from "next/cache";

import { jsonError, jsonOk, parseJsonBody } from "@/lib/account/http";
import {
  getAccountSnapshot,
  updateNotificationPreferences,
} from "@/lib/account/repository";
import { assertSameOrigin, requireAccountRequestContext } from "@/lib/account/server";
import type { AccountNotificationPreference, AccountNotificationTopic } from "@/lib/account/types";
import { accountNotificationsPutSchema } from "@/lib/account/validation";

export async function GET() {
  try {
    const context = await requireAccountRequestContext();
    const { notifications, pushSubscriptions } = await getAccountSnapshot(context);
    return jsonOk({ notifications, pushSubscriptions });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const snapshot = await getAccountSnapshot(context);
    const input = await parseJsonBody(request, accountNotificationsPutSchema);
    const preferenceMap = new Map<AccountNotificationTopic, AccountNotificationPreference>(
      snapshot.notifications.map((item) => [item.topic, item]),
    );
    const mergedPreferences: AccountNotificationPreference[] = input.preferences.map((item) => ({
      ...preferenceMap.get(item.topic as AccountNotificationTopic)!,
      ...item,
      topic: item.topic as AccountNotificationTopic,
    }));

    await updateNotificationPreferences(context, mergedPreferences);
    revalidatePath("/account/notifications");

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}
