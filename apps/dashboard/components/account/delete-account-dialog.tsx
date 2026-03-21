"use client";

import { useEffect, useRef, useState } from "react";

type DeleteAccountDialogProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (payload: { exportFirst: boolean; note: string | null }) => Promise<void>;
};

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [] as HTMLElement[];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

export function DeleteAccountDialog({
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [exportFirst, setExportFirst] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = getFocusableElements(dialogRef.current);
    focusable[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const items = getFocusableElements(dialogRef.current);
      const first = items[0];
      const last = items[items.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md">
      <div
        aria-describedby="delete-account-description"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="app-shell w-full max-w-2xl rounded-[32px] p-6"
        ref={dialogRef}
        role="dialog"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-red-200/58 uppercase">
              Destructive action
            </p>
            <h2
              className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white"
              id="delete-account-title"
            >
              Request account deletion
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400" id="delete-account-description">
              Your account access is removed immediately after the request is approved. Audit
              records stay preserved, privacy requests are tracked, and deleted data is handled
              according to platform retention and security policy.
            </p>
          </div>

          <div className="rounded-[24px] border border-red-300/16 bg-red-300/6 p-4 text-sm text-red-50/88">
            <p className="font-semibold">Before you submit</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-6 text-red-50/72">
              <li>Workspace access ends when deletion is processed.</li>
              <li>Exports can be requested first if policy allows.</li>
              <li>Some audit and security records may be retained.</li>
            </ul>
          </div>

          <label className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
            <input
              checked={exportFirst}
              className="h-4 w-4 accent-amber-300"
              onChange={(event) => setExportFirst(event.target.checked)}
              type="checkbox"
            />
            <span className="text-sm text-slate-200">Request an export before deletion</span>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
              Optional note
            </span>
            <textarea
              className="min-h-28 rounded-[20px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
              onChange={(event) => setNote(event.target.value)}
              value={note}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-white/42 uppercase">
              Type DELETE to continue
            </span>
            <input
              className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white"
              onChange={(event) => setConfirmText(event.target.value)}
              value={confirmText}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <button className="brandbuild-secondary-button h-11 px-4" onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className="rounded-full border border-red-300/22 bg-red-300/14 px-5 py-3 text-sm font-semibold text-red-50 transition hover:bg-red-300/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={confirmText !== "DELETE" || isSubmitting}
              onClick={() => onConfirm({ exportFirst, note: note.trim() || null })}
              type="button"
            >
              {isSubmitting ? "Submitting..." : "Submit deletion request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

