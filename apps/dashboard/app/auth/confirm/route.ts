import { handleAuthEmailActionRequest } from "@/lib/auth/email-action";

export async function GET(request: Request) {
  return handleAuthEmailActionRequest(request);
}
