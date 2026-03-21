import { getAccountSnapshot } from "@/lib/account/repository";
import { jsonError, jsonOk } from "@/lib/account/http";
import { requireAccountRequestContext } from "@/lib/account/server";

export async function GET() {
  try {
    const context = await requireAccountRequestContext();
    const snapshot = await getAccountSnapshot(context);
    return jsonOk(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}

