"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/app/lib/api";
import {
  emptyEventDraft,
  emptyTierDraft,
  validateEventDraft,
  validateTierDrafts,
  type EventDraft,
  type EventErrors,
  type TierDraft,
} from "@/app/lib/create-event";
import { localDateTimeInputToISO } from "@/app/lib/events-query";
import {
  emptyPaymentMethodDraft,
  validatePaymentMethodDrafts,
  type PaymentMethodDraft,
} from "@/app/lib/payment-methods";
import type {
  EventCreateInput,
  EventDetail,
  PaymentMethod,
  Tier,
} from "@/app/lib/types";
import { ArrowRight, Plus, X } from "../../ui/icons";
import EventFields from "./EventFields";
import PaymentMethodFields from "./PaymentMethodFields";
import TierFields from "./TierFields";

type Step = 1 | 2 | 3;

function messageFor(errorCode: string | undefined, status: number): string {
  if (status === 401) return "Your session expired. Please log in again.";
  if (errorCode === "VALIDATION_ERROR") {
    return "Please check the details and try again.";
  }
  if (status === 409) return "That tier name is already used for this event.";
  return "We couldn’t create your event. Please try again.";
}

function paymentMessageFor(errorCode: string | undefined, status: number): string {
  if (errorCode === "VALIDATION_ERROR") {
    return "Please check the payment details and try again.";
  }
  if (status === 409) return "That payment method is already used for this event.";
  return "We couldn’t add your payment methods. Please try again.";
}

/**
 * Create-event wizard, opened by the `?create=1` URL param so every CTA can be a
 * plain link. Three steps — event, tiers (0..N) then payment methods (0..N) —
 * with next/previous navigation. On submit it creates the event, then each tier
 * and each payment method; if a follow-up write fails, the freshly created event
 * is deleted so nothing partial is left behind.
 *
 * Creation only ever happens here, inside the authenticated dashboard.
 */
export default function CreateEventDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const open = searchParams.get("create") === "1";

  const closeRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<EventDraft>(emptyEventDraft);
  const [tiers, setTiers] = useState<TierDraft[]>([emptyTierDraft()]);
  const [payments, setPayments] = useState<PaymentMethodDraft[]>([
    emptyPaymentMethodDraft(),
  ]);
  const [errors, setErrors] = useState<EventErrors>({});
  const [tierErrors, setTierErrors] = useState<Record<number, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setStep(1);
    setDraft(emptyEventDraft());
    setTiers([emptyTierDraft()]);
    setPayments([emptyPaymentMethodDraft()]);
    setErrors({});
    setTierErrors({});
    setPaymentErrors({});
    setSubmitError(null);
    setSubmitting(false);
  }, []);

  const close = useCallback(() => {
    reset();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("create");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, reset]);

  // Focus in, close on Escape, and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) close();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, submitting, close]);

  const updateDraft = (patch: Partial<EventDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const updateTier = (index: number, patch: Partial<TierDraft>) =>
    setTiers((current) =>
      current.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)),
    );

  const addTier = () => setTiers((current) => [...current, emptyTierDraft()]);

  const removeTier = (index: number) => {
    setTiers((current) => current.filter((_, i) => i !== index));
    setTierErrors({});
  };

  const updatePayment = (index: number, patch: Partial<PaymentMethodDraft>) =>
    setPayments((current) =>
      current.map((payment, i) =>
        i === index ? { ...payment, ...patch } : payment,
      ),
    );

  const addPayment = () =>
    setPayments((current) => [...current, emptyPaymentMethodDraft()]);

  const removePayment = (index: number) => {
    setPayments((current) => current.filter((_, i) => i !== index));
    setPaymentErrors({});
  };

  function goNext() {
    if (step === 1) {
      const nextErrors = validateEventDraft(draft);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length === 0) setStep(2);
      return;
    }

    const { errors: nextTierErrors } = validateTierDrafts(tiers);
    setTierErrors(nextTierErrors);
    if (Object.keys(nextTierErrors).length === 0) setStep(3);
  }

  async function submit() {
    if (submitting) return;

    const eventErrors = validateEventDraft(draft);
    if (Object.keys(eventErrors).length > 0) {
      setErrors(eventErrors);
      setStep(1);
      return;
    }

    const { errors: nextTierErrors, payload: tierPayload } =
      validateTierDrafts(tiers);
    if (Object.keys(nextTierErrors).length > 0) {
      setTierErrors(nextTierErrors);
      setStep(2);
      return;
    }

    const { errors: nextPaymentErrors, payload: paymentPayload } =
      validatePaymentMethodDrafts(payments);
    if (Object.keys(nextPaymentErrors).length > 0) {
      setPaymentErrors(nextPaymentErrors);
      setStep(3);
      return;
    }

    setErrors({});
    setTierErrors({});
    setPaymentErrors({});
    setSubmitError(null);
    setSubmitting(true);

    // A tier-less event cannot sell anything, so it stays private.
    const body: EventCreateInput = {
      title: draft.title.trim(),
      startTime: localDateTimeInputToISO(draft.startTime) as string,
      endTime: localDateTimeInputToISO(draft.endTime) as string,
      isPublic: tierPayload.length === 0 ? false : draft.isPublic,
      priceUnit: draft.priceUnit.trim() || "USD",
    };
    if (draft.description.trim()) body.description = draft.description.trim();
    if (draft.location.trim()) body.location = draft.location.trim();
    if (draft.latitude !== null && draft.longitude !== null) {
      body.latitude = draft.latitude;
      body.longitude = draft.longitude;
    }

    let eventId: string | null = null;
    try {
      const eventRes = await apiRequest<EventDetail>("/events", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!eventRes.ok || !eventRes.data) {
        if (eventRes.status === 401) {
          router.replace("/login");
          return;
        }
        setSubmitError(messageFor(eventRes.errorCode, eventRes.status));
        return;
      }

      eventId = eventRes.data.id;

      for (const tier of tierPayload) {
        const tierRes = await apiRequest<Tier>(`/events/${eventId}/tiers`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tier),
        });

        if (!tierRes.ok) {
          // Roll back the event (allowed: it has no tickets yet).
          await apiRequest(`/events/${eventId}`, {
            method: "DELETE",
            credentials: "include",
            cache: "no-store",
          });
          setSubmitError(messageFor(tierRes.errorCode, tierRes.status));
          return;
        }
      }

      for (const payment of paymentPayload) {
        const paymentRes = await apiRequest<PaymentMethod>(
          `/events/${eventId}/payment-methods`,
          {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payment),
          },
        );

        if (!paymentRes.ok) {
          await apiRequest(`/events/${eventId}`, {
            method: "DELETE",
            credentials: "include",
            cache: "no-store",
          });
          setSubmitError(
            paymentMessageFor(paymentRes.errorCode, paymentRes.status),
          );
          return;
        }
      }

      close();
      router.refresh();
    } catch {
      if (eventId) {
        await apiRequest(`/events/${eventId}`, {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        }).catch(() => {});
      }
      setSubmitError("We couldn’t create your event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 px-4 py-8 sm:items-center"
      role="presentation"
      onClick={() => {
        if (!submitting) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-event-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Step {step} of 3
            </p>
            <h2
              id="create-event-title"
              className="mt-1 font-display text-2xl font-bold"
            >
              {step === 1
                ? "Event details"
                : step === 2
                  ? "Ticket tiers"
                  : "Payment methods"}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            disabled={submitting}
            aria-label="Close create event"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {submitError ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
          >
            {submitError}
          </p>
        ) : null}

        {step === 1 ? (
          <EventFields draft={draft} errors={errors} onChange={updateDraft} />
        ) : step === 2 ? (
          <TierFields
            tiers={tiers}
            errors={tierErrors}
            onChange={updateTier}
            onAdd={addTier}
            onRemove={removeTier}
          />
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <p className="rounded-2xl border-2 border-ink/15 bg-surface px-4 py-3 text-xs font-semibold text-ink-soft">
              Optional. Add how buyers can pay you — you can also do this later.
            </p>

            {payments.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-ink/30 px-4 py-8 text-center text-sm text-ink-soft">
                No payment methods yet. Add one so buyers know how to pay.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {payments.map((payment, index) => (
                  <li
                    key={index}
                    className="rounded-2xl border-2 border-ink bg-paper p-3 shadow-brutal-sm"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                        Method {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePayment(index)}
                        aria-label={`Remove payment method ${index + 1}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      >
                        <X className="h-4 w-4 text-danger" />
                      </button>
                    </div>
                    <PaymentMethodFields
                      draft={payment}
                      error={paymentErrors[index]}
                      onChange={(patch) => updatePayment(index, patch)}
                    />
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={addPayment}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Plus className="h-4 w-4" />
              Add payment method
            </button>
          </div>
        )}

        <footer className="mt-6 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => (current - 1) as Step)}
              disabled={submitting}
              className="rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
            >
              Previous
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-5 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create event"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
