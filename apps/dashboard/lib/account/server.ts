import { createHash, randomUUID } from "node:crypto";

import { createClient, type User } from "@supabase/supabase-js";
import { headers } from "next/headers";

import {
  accountAvatarAllowedMimeTypes,
  accountAvatarMaxBytes,
  accountReauthWindowMinutes,
} from "@/lib/account/constants";
import { createAdminSupabaseClient, isSupabaseAdminAvailable } from "@/lib/supabase/admin";
import { getAppUrl, getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class AccountApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AccountApiError";
  }
}

type HeaderLike = Headers | Awaited<ReturnType<typeof headers>>;

export type AccountRequestContext = {
  accessToken: string | null;
  approximateLocation: string | null;
  browser: string | null;
  currentSessionHash: string | null;
  ipAddress: string | null;
  os: string | null;
  sessionId: string | null;
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  user: User;
  userAgent: string | null;
};

type JwtClaims = {
  session_id?: string;
};

function decodeJwtClaims(token: string): JwtClaims | null {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as JwtClaims;
  } catch {
    return null;
  }
}

export function hashSessionIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getSessionIdFromAccessToken(token: string | null) {
  if (!token) {
    return null;
  }

  return decodeJwtClaims(token)?.session_id ?? null;
}

function getBrowserName(userAgent: string | null) {
  if (!userAgent) {
    return null;
  }

  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/Chrome\//i.test(userAgent)) return "Chrome";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  return "Browser";
}

function getOperatingSystem(userAgent: string | null) {
  if (!userAgent) {
    return null;
  }

  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown OS";
}

function getApproximateLocation(headerStore: HeaderLike) {
  const city = headerStore.get("x-vercel-ip-city");
  const region = headerStore.get("x-vercel-ip-country-region");
  const country = headerStore.get("x-vercel-ip-country");

  return [city, region, country].filter(Boolean).join(", ") || null;
}

export function makeSafeStoragePath(userId: string, kind: "avatars" | "covers", fileName: string) {
  const extension = fileName.toLowerCase().split(".").pop() ?? "bin";
  const safeBase = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `account/${userId}/${kind}/${safeBase || "upload"}-${randomUUID()}.${extension}`;
}

export async function resolvePrivateObjectUrl(path: string | null) {
  if (!path || !isSupabaseAdminAvailable()) {
    return null;
  }

  const bucketName = process.env.STORAGE_BUCKET_ASSETS || "assets";
  const admin = createAdminSupabaseClient();
  const signedUrlResult = await admin.storage.from(bucketName).createSignedUrl(path, 60 * 30);

  if (signedUrlResult.error) {
    return null;
  }

  return signedUrlResult.data.signedUrl;
}

export function validateAccountUpload(file: File) {
  if (
    !accountAvatarAllowedMimeTypes.includes(
      file.type as (typeof accountAvatarAllowedMimeTypes)[number],
    )
  ) {
    throw new AccountApiError("Upload a JPG, PNG, or WebP image.", 400);
  }

  if (file.size > accountAvatarMaxBytes) {
    throw new AccountApiError("Avatar uploads must be 5 MB or smaller.", 400);
  }
}

export async function requireAccountRequestContext(request?: Request): Promise<AccountRequestContext> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AccountApiError("Authentication required.", 401);
  }

  const headerStore = request?.headers ?? (await headers());
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? null;
  const sessionId = getSessionIdFromAccessToken(accessToken);

  return {
    accessToken,
    approximateLocation: getApproximateLocation(headerStore),
    browser: getBrowserName(headerStore.get("user-agent")),
    currentSessionHash: sessionId ? hashSessionIdentifier(sessionId) : null,
    ipAddress:
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      null,
    os: getOperatingSystem(headerStore.get("user-agent")),
    sessionId,
    supabase,
    user,
    userAgent: headerStore.get("user-agent"),
  };
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  const appOrigin = new URL(getAppUrl()).origin;

  if (origin !== appOrigin) {
    throw new AccountApiError("Cross-site requests are not allowed.", 403);
  }
}

export function assertRecentReauthentication(lastReauthenticatedAt: string | null) {
  if (!lastReauthenticatedAt) {
    throw new AccountApiError("Confirm your password again before making this change.", 403);
  }

  const cutoff = Date.now() - accountReauthWindowMinutes * 60 * 1000;

  if (new Date(lastReauthenticatedAt).getTime() < cutoff) {
    throw new AccountApiError(
      "Your recent verification expired. Re-authenticate and try again.",
      403,
    );
  }
}

export async function verifyPasswordForCurrentUser(
  userId: string,
  email: string | null,
  password: string,
) {
  if (!email) {
    throw new AccountApiError(
      "This account does not have a password-based login to verify.",
      400,
    );
  }

  const client = createClient(getSupabaseUrl(), getSupabasePublicKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const result = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (result.error || result.data.user?.id !== userId) {
    throw new AccountApiError("Password confirmation failed.", 401);
  }

  await client.auth.signOut();
}
