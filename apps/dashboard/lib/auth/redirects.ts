const defaultRedirectPath = "/dashboard";

function buildRelativeHref(pathname: "/login" | "/signup", params: Record<string, string | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function getSafeRedirectPath(
  redirectPath: string | null | undefined,
  fallback = defaultRedirectPath,
) {
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return fallback;
  }

  return redirectPath;
}

export function buildAbsoluteAppUrl(baseUrl: string, redirectPath: string) {
  return new URL(getSafeRedirectPath(redirectPath), baseUrl).toString();
}

export function buildAuthCallbackUrl(baseUrl: string, redirectPath: string) {
  const callbackUrl = new URL("/auth/callback", baseUrl);
  callbackUrl.searchParams.set("next", getSafeRedirectPath(redirectPath));

  return callbackUrl.toString();
}

export function buildAuthPageHref(pathname: "/login" | "/signup", redirectPath: string) {
  const safeRedirectPath = getSafeRedirectPath(redirectPath);

  if (safeRedirectPath === defaultRedirectPath) {
    return pathname;
  }

  return buildRelativeHref(pathname, { redirectedFrom: safeRedirectPath });
}

export function buildLoginErrorHref(errorMessage: string, redirectPath: string) {
  const safeRedirectPath = getSafeRedirectPath(redirectPath);
  return buildRelativeHref("/login", {
    error: errorMessage,
    redirectedFrom: safeRedirectPath !== defaultRedirectPath ? safeRedirectPath : null,
  });
}
