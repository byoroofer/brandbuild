"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AccountEmptyState } from "@/components/account/account-empty-state";
import type { AccountSession } from "@/lib/account/types";

type SessionListProps = {
  sessions: AccountSession[];
};

export function SessionList({ sessions }: SessionListProps) {
  const router = useRouter();
  const [items, setItems] = useState(sessions);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function revoke(id: string) {
    setPendingId(id);
    const response = await fetch(`/api/me/sessions/${id}`, {
      method: "DELETE",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't revoke that session.");
      setPendingId(null);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, revokedAt: new Date().toISOString() } : item,
      ),
    );
    setMessage("Session revoked.");
    setPendingId(null);
  }

  async function logout(path: "/api/auth/logout" | "/api/auth/logout-all") {
    setPendingId(path);
    const response = await fetch(path, {
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "We couldn't complete that sign-out action.");
      setPendingId(null);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <button
          className="brandbuild-secondary-button h-11 px-4"
          disabled={pendingId === "/api/auth/logout"}
          onClick={() => logout("/api/auth/logout")}
          type="button"
        >
          {pendingId === "/api/auth/logout" ? "Signing out..." : "Log out current session"}
        </button>
        <button
          className="brandbuild-primary-button h-11 px-4"
          disabled={pendingId === "/api/auth/logout-all"}
          onClick={() => logout("/api/auth/logout-all")}
          type="button"
        >
          {pendingId === "/api/auth/logout-all" ? "Signing out..." : "Log out all devices"}
        </button>
      </div>

      {items.length === 0 ? (
        <AccountEmptyState
          description="Session records appear here after authenticated account activity. Each row tracks browser, platform, and last-seen activity for the acting user."
          title="No device sessions recorded yet"
        />
      ) : (
        items.map((session) => (
          <div
            className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
            key={session.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-white">
                    {session.sessionLabel ?? "Device session"}
                  </p>
                  {session.current ? (
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-amber-50 uppercase">
                      Current
                    </span>
                  ) : null}
                  {session.revokedAt ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-white/72 uppercase">
                      Revoked
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {session.browser ?? "Browser"} {session.os ? `on ${session.os}` : ""}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {session.approximateLocation ?? "Location unavailable"} • Last active{" "}
                  {new Date(session.lastActiveAt).toLocaleString()}
                </p>
              </div>

              <button
                className="brandbuild-secondary-button h-11 px-4"
                disabled={Boolean(session.revokedAt) || pendingId === session.id}
                onClick={() => revoke(session.id)}
                type="button"
              >
                {pendingId === session.id ? "Revoking..." : "Revoke session"}
              </button>
            </div>
          </div>
        ))
      )}

      {message ? (
        <p aria-live="polite" className="text-sm text-slate-300">
          {message}
        </p>
      ) : null}
    </div>
  );
}

