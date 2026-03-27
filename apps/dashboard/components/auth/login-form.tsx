"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { buildAbsoluteAppUrl, buildAuthPageHref } from "@/lib/auth/redirects";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  redirectPath: string;
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300";

export function LoginForm({ redirectPath }: LoginFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const supabaseAvailable = hasSupabaseEnv() && Boolean(supabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isMagicLinkSubmitting, setIsMagicLinkSubmitting] = useState(false);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setErrorMessage(
        "Supabase auth is not configured in this deployment yet. Add NEXT_PUBLIC_SUPABASE_URL and the public Supabase browser key in Vercel, then redeploy.",
      );
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setIsPasswordSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to log in right now.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  async function handleMagicLinkRequest() {
    if (!supabase) {
      setErrorMessage(
        "Supabase auth is not configured in this deployment yet. Add NEXT_PUBLIC_SUPABASE_URL and the public Supabase browser key in Vercel, then redeploy.",
      );
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Enter your work email first and then request a magic link.");
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setIsMagicLinkSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: buildAbsoluteAppUrl(window.location.origin, redirectPath),
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      setInfoMessage(
        "Check your inbox for a BrandBuild sign-in email. The link will bring you back into the app, not a generic Supabase screen.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't send a magic link right now.",
      );
    } finally {
      setIsMagicLinkSubmitting(false);
    }
  }

  return (
    <SurfaceCard className="p-8 sm:p-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
            Welcome back
          </span>
          <div className="space-y-2">
            <h1 className="display-font text-4xl leading-none text-slate-950">Log in to BrandBuild</h1>
            <p className="text-base leading-7 text-slate-600">
              Use a password or request a branded magic link to get back into the AI video studio workspace.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="login-email">
              Work email
            </label>
            <input
              autoComplete="email"
              className={inputClassName}
              disabled={!supabaseAvailable}
              id="login-email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="team@brandbuild.online"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-slate-700" htmlFor="login-password">
                Password
              </label>
              <Link className="text-sm font-semibold text-blue-700" href="/reset-password">
                Forgot password?
              </Link>
            </div>
            <input
              autoComplete="current-password"
              className={inputClassName}
              disabled={!supabaseAvailable}
              id="login-password"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              type="password"
              value={password}
            />
          </div>

          {!supabaseAvailable ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Auth is not configured in this deployment yet. Add the public Supabase env vars in
              Vercel to enable operator login.
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          {infoMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {infoMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              disabled={isPasswordSubmitting || !supabaseAvailable}
              size="lg"
              type="submit"
            >
              {isPasswordSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <Button
              className="w-full"
              disabled={isMagicLinkSubmitting || isPasswordSubmitting || !supabaseAvailable}
              onClick={handleMagicLinkRequest}
              size="lg"
              type="button"
              variant="secondary"
            >
              {isMagicLinkSubmitting ? "Sending magic link..." : "Email me a magic link"}
            </Button>
          </div>
        </form>

        <p className="text-sm text-slate-600">
          Need internal access?{" "}
          <Link className="font-semibold text-blue-700" href={buildAuthPageHref("/signup", redirectPath)}>
            Create an account
          </Link>
          .
        </p>
      </div>
    </SurfaceCard>
  );
}
