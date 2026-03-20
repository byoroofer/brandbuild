const localhostAppUrl = "http://localhost:3000";

function normalizeAppUrl(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export function resolveAppUrl() {
  return (
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeAppUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeAppUrl(process.env.VERCEL_URL) ??
    localhostAppUrl
  );
}
