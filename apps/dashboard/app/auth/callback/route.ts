import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  buildLoginErrorHref,
  getSafeRedirectPath,
} from "@/lib/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const supportedEmailOtpTypes: EmailOtpType[] = [
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
];

function isSupportedEmailOtpType(value: string | null): value is EmailOtpType {
  return value ? supportedEmailOtpTypes.includes(value as EmailOtpType) : false;
}

function buildAbsoluteRedirect(request: Request, pathname: string) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto ?? requestUrl.protocol.replace(":", "");
  const host = forwardedHost ?? requestUrl.host;

  return `${protocol}://${host}${pathname}`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextPath = getSafeRedirectPath(searchParams.get("next"));
  const callbackError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (callbackError) {
    return NextResponse.redirect(
      buildAbsoluteRedirect(request, buildLoginErrorHref(callbackError, nextPath)),
    );
  }

  const supabase = await createServerSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(buildAbsoluteRedirect(request, nextPath));
    }

    return NextResponse.redirect(
      buildAbsoluteRedirect(
        request,
        buildLoginErrorHref("We could not complete email confirmation. Please try again.", nextPath),
      ),
    );
  }

  if (tokenHash && isSupportedEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(buildAbsoluteRedirect(request, nextPath));
    }

    return NextResponse.redirect(
      buildAbsoluteRedirect(
        request,
        buildLoginErrorHref("This confirmation link is invalid or expired.", nextPath),
      ),
    );
  }

  return NextResponse.redirect(
    buildAbsoluteRedirect(
      request,
      buildLoginErrorHref("We could not verify that link. Please log in again.", nextPath),
    ),
  );
}
