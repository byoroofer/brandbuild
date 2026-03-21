"use client";

type SaveBarProps = {
  dirty: boolean;
  disabled?: boolean;
  isSaving?: boolean;
  message?: string | null;
  onReset?: () => void;
  onSave?: () => void;
  saveLabel?: string;
};

export function SaveBar({
  dirty,
  disabled = false,
  isSaving = false,
  message,
  onReset,
  onSave,
  saveLabel = "Save changes",
}: SaveBarProps) {
  if (!dirty && !message) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-3 rounded-[26px] border border-amber-300/16 bg-[rgba(7,9,14,0.92)] px-4 py-4 shadow-[0_30px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            {dirty ? "You have unsaved changes." : "Saved successfully."}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {message ?? "Review your changes, then save them to update this account module."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onReset ? (
            <button
              className="brandbuild-secondary-button h-11 px-4"
              onClick={onReset}
              type="button"
            >
              Reset
            </button>
          ) : null}

          {onSave ? (
            <button
              className="brandbuild-primary-button h-11 px-5"
              disabled={disabled || isSaving}
              onClick={onSave}
              type="button"
            >
              {isSaving ? "Saving..." : saveLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

