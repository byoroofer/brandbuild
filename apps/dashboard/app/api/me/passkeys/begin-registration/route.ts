import { jsonError, jsonOk } from "@/lib/account/http";
import { AccountApiError, assertSameOrigin } from "@/lib/account/server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    throw new AccountApiError(
      "Passkey ceremony wiring requires WebAuthn runtime configuration for this deployment.",
      501,
    );
  } catch (error) {
    return jsonError(error);
  }
}

