import { revalidatePath } from "next/cache";

import { buildAbsoluteAppUrl } from "@/lib/auth/redirects";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/account/http";
import { getAccountSnapshot, updateAccountProfile } from "@/lib/account/repository";
import {
  assertRecentReauthentication,
  assertSameOrigin,
  requireAccountRequestContext,
} from "@/lib/account/server";
import { accountProfilePatchSchema } from "@/lib/account/validation";
import { getAppUrl } from "@/lib/supabase/env";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const context = await requireAccountRequestContext(request);
    const snapshot = await getAccountSnapshot(context);
    const input = await parseJsonBody(request, accountProfilePatchSchema);

    if (input.authEmail || input.newPassword) {
      assertRecentReauthentication(snapshot.preferences.lastReauthenticatedAt);
    }

    const normalizedAuthEmail = input.authEmail?.trim().toLowerCase() || null;
    const normalizedNewPassword = input.newPassword?.trim() || null;
    const shouldChangeAuthEmail =
      Boolean(normalizedAuthEmail) && normalizedAuthEmail !== snapshot.user.email;
    const shouldChangePassword = Boolean(normalizedNewPassword);
    let message = "Profile updated.";

    if (shouldChangeAuthEmail || shouldChangePassword) {
      const authAttributes: Record<string, string> = {};

      if (shouldChangeAuthEmail && normalizedAuthEmail) {
        authAttributes.email = normalizedAuthEmail;
      }

      if (shouldChangePassword && normalizedNewPassword) {
        authAttributes.password = normalizedNewPassword;
      }

      const authUpdate = await context.supabase.auth.updateUser(authAttributes, {
        emailRedirectTo: buildAbsoluteAppUrl(getAppUrl(), "/account/security"),
      });

      if (authUpdate.error) {
        throw authUpdate.error;
      }

      if (shouldChangeAuthEmail && shouldChangePassword) {
        message =
          "Security settings updated. Check your inbox for a BrandBuild email confirmation to finish changing the sign-in email. Your new password is already saved.";
      } else if (shouldChangeAuthEmail) {
        message =
          "Security settings updated. Check your inbox for a BrandBuild email confirmation to finish changing the sign-in email.";
      } else {
        message = "Security settings updated.";
      }
    }

    await updateAccountProfile(context, {
      ...input,
      authEmail: undefined,
      newPassword: undefined,
    });
    revalidatePath("/account");
    revalidatePath("/account/profile");
    revalidatePath("/account/security");

    return jsonOk({
      message,
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}
