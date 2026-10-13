"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/app/lib/api";
import {
  buildPaymentMethodUpdateInput,
  emptyPaymentMethodDraft,
  paymentMethodDraftFromMethod,
  validatePaymentMethodDrafts,
  validatePaymentMethodUpdate,
  type PaymentMethodDraft,
} from "@/app/lib/payment-methods";
import type { PaymentMethod } from "@/app/lib/types";
import { X } from "../../ui/icons";
import PaymentMethodFields from "./PaymentMethodFields";

function messageFor(
  errorCode: string | undefined,
  status: number,
  editing: boolean,
): string {
  if (status === 401) return "Your session expired. Please log in again.";
  if (errorCode === "VALIDATION_ERROR" || status === 400) {
    return "Please check the details and try again.";
  }
  if (status === 409) {
    return editing
      ? "This payment method is already used by existing orders, so it can’t be changed."
      : "This payment method is already used by existing orders.";
  }
  if (status === 403) return "Only the event creator can manage payment methods.";
  if (status === 404) return "This event or payment method no longer exists.";
  return editing
    ? "We couldn’t save the payment method. Please try again."
    : "We couldn’t add the payment method. Please try again.";
}

/**
 * Create / edit popup for a single payment method, driven by whether `method`
 * is provided. Mirrors `CreateTierDialog`'s focus / Escape / scroll-lock. On
 * success the server-rendered list is refreshed so the change appears.
 */
export default function PaymentMethodDialog({
  eventId,
  method,
  onClose,
}: {
  eventId: string;
  method?: PaymentMethod;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const editing = Boolean(method);

  const [initial] = useState<PaymentMethodDraft>(() =>
    method ? paymentMethodDraftFromMethod(method) : emptyPaymentMethodDraft(),
  );
  const [draft, setDraft] = useState<PaymentMethodDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Focus the first field on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape and lock body scroll while open.
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

  function update(patch: Partial<PaymentMethodDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setError(null);
  }

  async function submit() {
    if (submitting) return;

    if (editing && method) {
      const validationError = validatePaymentMethodUpdate(draft);
      if (validationError) {
        setError(validationError);
        return;
      }

      const body = buildPaymentMethodUpdateInput(initial, draft);
      if (Object.keys(body).length === 0) {
        onClose();
        return;
      }

      setError(null);
      setSubmitting(true);
      try {
        const res = await apiRequest<PaymentMethod>(
          `/payment-methods/${method.id}`,
          {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );

        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          setError(messageFor(res.errorCode, res.status, true));
          return;
        }

        onClose();
        router.refresh();
      } catch {
        setError("We couldn’t save the payment method. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const { errors, payload } = validatePaymentMethodDrafts([draft]);
    if (errors[0]) {
      setError(errors[0]);
      return;
    }
    if (payload.length === 0) {
      setError("Fill in the payment method details.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await apiRequest<PaymentMethod>(
        `/events/${eventId}/payment-methods`,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload[0]),
        },
      );

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setError(messageFor(res.errorCode, res.status, false));
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("We couldn’t add the payment method. Please try again.");
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
        aria-labelledby="payment-method-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Payment methods
            </p>
            <h2
              id="payment-method-title"
              className="mt-1 font-display text-2xl font-bold"
            >
              {editing ? "Edit payment method" : "Add payment method"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close payment method"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-5">
          <PaymentMethodFields
            draft={draft}
            error={error}
            onChange={update}
            nameInputRef={inputRef}
          />
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
            className="rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            {submitting
              ? "Saving…"
              : editing
                ? "Save changes"
                : "Add method"}
          </button>
        </footer>
      </div>
    </div>
  );
}
