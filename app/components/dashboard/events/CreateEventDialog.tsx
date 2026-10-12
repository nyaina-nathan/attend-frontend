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
import type {
  EventCreateInput,
  EventDetail,
  Tier,
} from "@/app/lib/types";
import { ArrowRight, X } from "../../ui/icons";
import EventFields from "./EventFields";
import TierFields from "./TierFields";

type Step = 1 | 2;

function messageFor(errorCode: string | undefined, status: number): string {
  if (status === 401) return "Your session expired. Please log in again.";
  if (errorCode === "VALIDATION_ERROR") {
    return "Please check the details and try again.";
  }
  if (status === 409) return "That tier name is already used for this event.";
  return "We couldn’t create your event. Please try again.";
}

/**
 * Create-event wizard, opened by the `?create=1` URL param so every CTA can be a
 * plain link. Two steps — event then tiers (0..N) — with next/previous
 * navigation. On submit it creates the event, then each tier; if a tier fails,
 * the freshly created event is deleted so nothing partial is left behind.
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
  const [errors, setErrors] = useState<EventErrors>({});
  const [tierErrors, setTierErrors] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setStep(1);
    setDraft(emptyEventDraft());
    setTiers([emptyTierDraft()]);
    setErrors({});
    setTierErrors({});
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

  function goNext() {
    const nextErrors = validateEventDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep(2);
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
      return;
    }

    setErrors({});
    setTierErrors({});
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
              Step {step} of 2
            </p>
            <h2
              id="create-event-title"
              className="mt-1 font-display text-2xl font-bold"
            >
              {step === 1 ? "Event details" : "Ticket tiers"}
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
        ) : (
          <TierFields
            tiers={tiers}
            errors={tierErrors}
            onChange={updateTier}
            onAdd={addTier}
            onRemove={removeTier}
          />
        )}

        <footer className="mt-6 flex items-center justify-between gap-3">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={submitting}
              className="rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
            >
              Previous
            </button>
          ) : (
            <span />
          )}

          {step === 1 ? (
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
