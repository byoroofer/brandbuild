import { jsonError, jsonOk, parseJsonBody } from "@/lib/account/http";
import {
  createPrivacyRequest,
  enforceAuditRateLimit,
  getLatestDeleteRequest,
  getAccountSnapshot,
} from "@/lib/account/repository";
import {
  assertRecentReauthentication,
  assertSameOrigin,
  requireAccountRequestContext,
} from "@/lib/account/server";
import { accountDeleteRequestSchema } from "@/lib/account/validation";

export async function GET() {
  try {
    const context = await requireAccountRequestContext();
    const requestRow = await getLatestDeleteRequest(context);

    return jsonOk({
      request: requestRow
        ? {
            completedAt: requestRow.completed_at,
            createdAt: requestRow.created_at,
            id: requestRow.id,
            requestType: requestRow.request_type,
            requestedExportFirst: requestRow.requested_export_first ?? false,
            status: requestRow.status,
            statusDetail: requestRow.status_detail,
          }
        : null,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const snapshot = await getAccountSnapshot(context);
    const input = await parseJsonBody(request, accountDeleteRequestSchema);

    assertRecentReauthentication(snapshot.preferences.lastReauthenticatedAt);
    await enforceAuditRateLimit(context, "account_delete_requested", 2, 60);

    const requestRow = await createPrivacyRequest(context, {
      requestType: "delete",
      requestedExportFirst: input.exportFirst,
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

