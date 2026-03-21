import { jsonError, jsonOk } from "@/lib/account/http";
import { listSessionsForUser } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export async function GET() {
  try {
    const context = await requireAccountRequestContext();
    const sessions = await listSessionsForUser(context);
    return jsonOk({ sessions });
  } catch (error) {
    return jsonError(error);
  }
}

