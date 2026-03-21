import { jsonError, jsonOk, parseJsonBody } from "@/lib/account/http";
import { createPrivacyRequest, enforceAuditRateLimit } from "@/lib/account/repository";
import { assertSameOrigin, requireAccountRequestContext } from "@/lib/account/server";
import { accountExportRequestSchema } from "@/lib/account/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const input = await parseJsonBody(request, accountExportRequestSchema);

    await enforceAuditRateLimit(context, "account_export_requested", 3, 60);
    const requestRow = await createPrivacyRequest(context, {
      requestType: "export",
      statusDetail: input.note,
    });

    return jsonOk({
      request: {
        completedAt: requestRow.completed_at,
        createdAt: requestRow.created_at,
        id: requestRow.id,
        requestType: requestRow.request_type,
        requestedExportFirst: requestRow.requested_export_first ?? false,
        status: requestRow.status,
        statusDetail: requestRow.status_detail,
      },
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

