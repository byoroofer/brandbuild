import { jsonError, jsonOk } from "@/lib/account/http";
import { deletePasskey } from "@/lib/account/repository";
import { assertSameOrigin, requireAccountRequestContext } from "@/lib/account/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, { params }: Params) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const { id } = await params;
    await deletePasskey(context, id);

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}
