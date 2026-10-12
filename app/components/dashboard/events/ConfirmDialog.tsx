"use client";

import { useEffect, useRef } from "react";

/**
 * Small confirmation modal. Mirrors the `CreateEventDialog` interaction model:
 * focus moves to the safe action, Escape and the overlay close it, and body
 * scroll is locked while open. The confirm action is expected to be destructive.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel = "Working…",
  cancelLabel = "Cancel",
  tone = "danger",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  /** `danger` paints the confirm button red; `warning` paints it amber. */
  tone?: "danger" | "warning";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 py-8"
      role="presentation"
      onClick={() => {
        if (!pending) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? "confirm-description" : undefined}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border-2 border-ink bg-paper p-6 shadow-brutal-xl"
      >
        <h2 id="confirm-title" className="font-display text-xl font-bold">
          {title}
        </h2>
        {description ? (
          <p id="confirm-description" className="mt-2 text-sm text-ink-soft">
            {description}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-full border-2 border-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60 ${
              tone === "warning" ? "bg-warning" : "bg-danger"
            }`}
          >
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
