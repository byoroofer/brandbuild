"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    setIsSubmitting(true);

    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button disabled={isSubmitting} onClick={handleSignOut} type="button" variant="ghost">
      {isSubmitting ? "Signing out..." : "Sign out"}
    </Button>
  );
}
