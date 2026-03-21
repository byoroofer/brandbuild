"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { buildAbsoluteAppUrl } from "@/lib/auth/redirects";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300";

type ResetMode = "checking" | "request" | "update";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const supabaseAvailable = hasSupabaseEnv() && Boolean(supabase);
  const [mode, setMode] = useState<ResetMode>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabaseAvailable || !supabase) {
      setMode("request");
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return;
      }

      setMode(data.user ? "update" : "request");
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || session?.user) {
        setMode("update");
        return;
      }

      setMode("request");
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, supabaseAvailable]);

  async function handleResetRequest() {
    if (!supabase) {
      setErrorMessage(
        "Supabase auth is not configured in this deployment yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.",
      );
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Enter your work email first and then request a reset link.");
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: buildAbsoluteAppUrl(window.location.origin, "/reset-password"),
      });

      if (error) {
        throw error;
      }

      setInfoMessage(
        "Check your inbox for a BrandBuild password reset email. The link will bring you back into the app to finish the update.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't send a reset email right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordUpdate() {
    if (!supabase) {
      setErrorMessage(
        "Supabase auth is not configured in this deployment yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.",
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The new password and confirmation do not match.");
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setInfoMessage("Password updated. Taking you back into BrandBuild.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't update your password right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isUpdateMode = mode === "update";

  return (
    <SurfaceCard className="p-8 sm:p-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
            Secure account recovery
          </span>
          <div className="space-y-2">
            <h1 className="display-font text-4xl leading-none text-slate-950">
              {isUpdateMode ? "Set a new password" : "Reset your password"}
            </h1>
            <p className="text-base leading-7 text-slate-600">
              {isUpdateMode
                ? "Your reset link is confirmed. Set a new password to continue into the BrandBuild workspace."
                : "Request a branded reset email and finish the password update inside the app, not on a generic Supabase screen."}
            </p>
          </div>
        </div>

        {mode === "checking" ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Checking your secure reset session...
          </div>
        ) : (
          <div className="space-y-4">
            {!isUpdateMode ? (
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Work email</span>
                <input
                  autoComplete="email"
                  className={inputClassName}
                  disabled={!supabaseAvailable}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="team@brandbuild.online"
                  type="email"
                  value={email}
                />
              </label>
            ) : (
              <>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">New password</span>
                  <input
                    autoComplete="new-password"
                    className={inputClassName}
                    disabled={!supabaseAvailable}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    type="password"
                    value={password}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Confirm password</span>
                  <input
                    autoComplete="new-password"
                    className={inputClassName}
                    disabled={!supabaseAvailable}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your new password"
                    type="password"
                    value={confirmPassword}
                  />
                </label>
              </>
            )}

            {!supabaseAvailable ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Auth is not configured in this deployment yet. Add the public Supabase env vars in
                Vercel to enable password reset.
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

            <Button
              className="w-full"
              disabled={!supabaseAvailable || isSubmitting}
              onClick={isUpdateMode ? handlePasswordUpdate : handleResetRequest}
              size="lg"
              type="button"
            >
              {isSubmitting
                ? isUpdateMode
                  ? "Updating password..."
                  : "Sending reset email..."
                : isUpdateMode
                  ? "Update password"
                  : "Send reset email"}
            </Button>
          </div>
        )}

        <p className="text-sm text-slate-600">
          Back to sign in?{" "}
          <Link className="font-semibold text-blue-700" href="/login">
            Return to login
          </Link>
          .
        </p>
      </div>
    </SurfaceCard>
  );
}
