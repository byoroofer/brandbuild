"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { buildAuthCallbackUrl, buildAuthPageHref } from "@/lib/auth/redirects";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";

type SignupFormProps = {
  redirectPath: string;
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300";

export function SignupForm({ redirectPath }: SignupFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const supabaseAvailable = hasSupabaseEnv() && Boolean(supabase);
  const profilesTable = supabase ? (supabase.from("profiles") as any) : null;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !profilesTable) {
      setErrorMessage(
        "Supabase auth is not configured in this deployment yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.",
      );
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const emailRedirectTo = buildAuthCallbackUrl(window.location.origin, redirectPath);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
          emailRedirectTo,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
          id: data.user.id,
          ...(fullName ? { full_name: fullName } : {}),
        };

        await profilesTable.upsert(profilePayload, {
          onConflict: "id",
        });
      }

      if (data.session) {
        router.push(redirectPath);
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Account created. Check your inbox, confirm your email, and we’ll bring you into the studio workspace.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't create your account right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SurfaceCard className="p-8 sm:p-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
            Internal team signup
          </span>
          <div className="space-y-2">
            <h1 className="display-font text-4xl leading-none text-slate-950">Create AI Video Studio access</h1>
            <p className="text-base leading-7 text-slate-600">
              Set up a simple internal operator account for planning campaigns, prompts, assets, and reviews.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="signup-full-name">
              Full name
            </label>
            <input
              autoComplete="name"
              className={inputClassName}
              disabled={!supabaseAvailable}
              id="signup-full-name"
              name="fullName"
              placeholder="Your name"
              required
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="signup-email">
              Email
            </label>
            <input
              autoComplete="email"
              className={inputClassName}
              disabled={!supabaseAvailable}
              id="signup-email"
              name="email"
              placeholder="team@yourstudio.com"
              required
              type="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="signup-password">
              Password
            </label>
            <input
              autoComplete="new-password"
              className={inputClassName}
              disabled={!supabaseAvailable}
              id="signup-password"
              minLength={8}
              name="password"
              placeholder="At least 8 characters"
              required
              type="password"
            />
          </div>

          {!supabaseAvailable ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Auth is not configured in this deployment yet. Add the public Supabase env vars in
              Vercel to enable internal signup and login.
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting || !supabaseAvailable} size="lg" type="submit">
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-slate-600">
          Already on the team?{" "}
          <Link className="font-semibold text-blue-700" href={buildAuthPageHref("/login", redirectPath)}>
            Log in instead
          </Link>
          .
        </p>
      </div>
    </SurfaceCard>
  );
}
