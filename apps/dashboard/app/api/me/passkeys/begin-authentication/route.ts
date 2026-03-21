import { jsonError } from "@/lib/account/http";
import { AccountApiError, assertSameOrigin } from "@/lib/account/server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    throw new AccountApiError(
      "Passkey authentication ceremony wiring is not enabled on this deployment yet.",
      501,
    );
  } catch (error) {
    return jsonError(error);
  }
}

