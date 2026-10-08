"use client";

import { useEffect } from "react";
import { X } from "../ui/icons";
import type { AuthError } from "./useAuthError";

/**
 * Red error banner pinned to the top of an auth form. Auto-dismisses after
 * 10 seconds; because the effect keys on the error object, a freshly raised
 * error (new nonce) restarts the timer.
 */
export default function AuthFormError({
  error,
  onDismiss,
}: {
  error: AuthError | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(onDismiss, 10_000);
    return () => clearTimeout(timer);
  }, [error, onDismiss]);

  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start justify-between gap-3 rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
    >
      <span>{error.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="-mr-1 -mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-brutal hover:bg-danger/15"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
