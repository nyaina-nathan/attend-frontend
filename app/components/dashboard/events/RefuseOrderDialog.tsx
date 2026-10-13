"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { refuseOrder } from "@/app/lib/event-orders";
import { X } from "../../ui/icons";

function messageFor(errorCode: string | undefined, status: number): string {
  if (status === 401) return "Your session expired. Please log in again.";
  if (status === 400) return "Please enter a reason for refusing this order.";
  if (status === 409) return "This order is no longer pending, so it can’t be refused.";
  if (status === 403) return "Only the event creator or admins can review orders.";
  if (status === 404) return "This order no longer exists.";
  return "We couldn’t refuse this order. Please try again.";
}

/**
 * Refusal popup for one `PENDING` order. The API requires a reason, so this
 * hosts a small form rather than reusing `ConfirmDialog`. Focus moves to the
 * reason field, Escape and the overlay close it, and body scroll is locked.
 */
export default function RefuseOrderDialog({
  orderId,
  buyerName,
  onClose,
  onRefused,
}: {
  orderId: string;
  buyerName: string;
  onClose: () => void;
  onRefused: () => void;
}) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [submitting, onClose]);

  async function submit() {
    if (submitting) return;

    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please enter a reason for refusing this order.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await refuseOrder(orderId, trimmed);
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setError(messageFor(res.errorCode, res.status));
        return;
      }
      onRefused();
    } catch {
      setError("We couldn’t refuse this order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 px-4 py-8 sm:items-center"
      role="presentation"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refuse-order-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Review order
            </p>
            <h2
              id="refuse-order-title"
              className="mt-1 font-display text-2xl font-bold"
            >
              Refuse order
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <p className="mt-4 text-sm text-ink-soft">
          Let {buyerName} know why this order is being refused. The reason is
          recorded on the order.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <label
            htmlFor="refuse-reason"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft"
          >
            Reason
          </label>
          <textarea
            id="refuse-reason"
            ref={textareaRef}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError(null);
            }}
            rows={4}
            disabled={submitting}
            placeholder="e.g. Payment reference could not be verified."
            className="w-full resize-y rounded-2xl border-2 border-ink bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/70 focus:border-accent disabled:opacity-60"
          />
          {error ? (
            <p role="alert" className="text-sm font-semibold text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded-full border-2 border-ink bg-danger px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            {submitting ? "Refusing…" : "Refuse order"}
          </button>
        </footer>
      </div>
    </div>
  );
}
