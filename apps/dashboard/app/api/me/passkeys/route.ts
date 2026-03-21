import { jsonError, jsonOk } from "@/lib/account/http";
import { listPasskeysForUser } from "@/lib/account/repository";
import { requireAccountRequestContext } from "@/lib/account/server";

export async function GET() {
  try {
    const context = await requireAccountRequestContext();
    const passkeys = await listPasskeysForUser(context);
    return jsonOk({ passkeys });
  } catch (error) {
    return jsonError(error);
  }
}

