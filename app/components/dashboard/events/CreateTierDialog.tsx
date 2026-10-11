"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/app/lib/api";
import {
  emptyTierDraft,
  validateTierDrafts,
  type TierDraft,
} from "@/app/lib/create-event";
import type { Tier } from "@/app/lib/types";
import { X } from "../../ui/icons";
import TierFormFields from "./TierFormFields";

function messageFor(errorCode: string | undefined, status: number): string {
  if (status === 401) return "Your session expired. Please log in again.";
  if (errorCode === "VALIDATION_ERROR") {
    return "Please check the details and try again.";
  }
  if (status === 409) return "That tier name is already used for this event.";
  if (status === 403) return "You don’t have permission to add tiers.";
  if (status === 404) return "This event no longer exists.";
  return "We couldn’t create the tier. Please try again.";
}

/**
 * "Create new tier" popup: collects the `TierCreateRequest` fields (name, price,
 * capacity) and posts them to `POST /events/{eventId}/tiers`. On success the
 * server-rendered detail page is refreshed so the new tier appears. Mounted only
 * while open, so it starts from a clean slate; mirrors the focus/Escape/
 * scroll-lock behaviour of `CreateEventDialog`.
 */
export default function CreateTierDialog({
  eventId,
  onClose,
}: {
  eventId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<TierDraft>(emptyTierDraft);
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

  function update(patch: Partial<TierDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setError(null);
  }

  async function submit() {
    if (submitting) return;

    const { errors, payload } = validateTierDrafts([draft]);
    if (errors[0]) {
      setError(errors[0]);
      return;
    }
    if (payload.length === 0) {
      setError("Fill in the tier details.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await apiRequest<Tier>(`/events/${eventId}/tiers`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload[0]),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setError(messageFor(res.errorCode, res.status));
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("We couldn’t create the tier. Please try again.");
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
        aria-labelledby="create-tier-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Ticket tiers
            </p>
            <h2
              id="create-tier-title"
              className="mt-1 font-display text-2xl font-bold"
            >
              Create new tier
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close create tier"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-5">
          <TierFormFields
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
            {submitting ? "Creating…" : "Create tier"}
          </button>
        </footer>
      </div>
    </div>
  );
}
