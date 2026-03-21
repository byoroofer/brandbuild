import { revalidatePath } from "next/cache";

import { jsonError, jsonOk } from "@/lib/account/http";
import {
  deleteStoredObject,
  getAccountSnapshot,
  storeAvatarPath,
  uploadPrivateAccountObject,
} from "@/lib/account/repository";
import {
  assertSameOrigin,
  makeSafeStoragePath,
  requireAccountRequestContext,
  resolvePrivateObjectUrl,
  validateAccountUpload,
} from "@/lib/account/server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("A file is required.");
    }

    validateAccountUpload(file);

    const snapshot = await getAccountSnapshot(context);
    const nextPath = makeSafeStoragePath(context.user.id, "avatars", file.name);

    await uploadPrivateAccountObject(nextPath, file);
    await storeAvatarPath(context, nextPath);

    if (snapshot.profile.avatarPath && snapshot.profile.avatarPath !== nextPath) {
      await deleteStoredObject(snapshot.profile.avatarPath);
    }

    revalidatePath("/account/profile");

    return jsonOk({
      avatarPath: nextPath,
      avatarUrl: await resolvePrivateObjectUrl(nextPath),
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const snapshot = await getAccountSnapshot(context);

    if (snapshot.profile.avatarPath) {
      await deleteStoredObject(snapshot.profile.avatarPath);
    }

    await storeAvatarPath(context, null);
    revalidatePath("/account/profile");

    return jsonOk({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}

