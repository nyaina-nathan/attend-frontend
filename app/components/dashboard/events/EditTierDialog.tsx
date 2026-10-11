"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/app/lib/api";
import type { TierDraft } from "@/app/lib/create-event";
import {
  buildTierUpdateInput,
  issuedCount,
  tierDraftFromTier,
  validateTierUpdate,
} from "@/app/lib/edit-tier";
import type { Tier } from "@/app/lib/types";
import { X } from "../../ui/icons";
import TierFormFields from "./TierFormFields";

function messageFor(errorCode: string | undefined, status: number): string {
  if (status === 401) return "Your session expired. Please log in again.";
  if (errorCode === "VALIDATION_ERROR" || status === 400) {
    return "Please check the details and try again.";
  }
  if (status === 403) return "You don’t have permission to edit this tier.";
  if (status === 404) return "This tier no longer exists.";
  if (status === 409) {
    return "That tier name is already used, or the capacity is below the tickets already issued.";
  }
  return "We couldn’t save the tier. Please try again.";
}

/**
 * "Edit tier" popup: changes a tier's name, price and capacity and PATCHes the
 * changed fields to `PATCH /tiers/{tierId}`. Capacity can't drop below the
 * tickets already issued, so that rule is shown up front (the API enforces it
 * with a `409`). On success the server-rendered detail page is refreshed.
 */
export default function EditTierDialog({
  tier,
  onClose,
}: {
  tier: Tier;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const issued = issuedCount(tier);

  const [initial] = useState<TierDraft>(() => tierDraftFromTier(tier));
  const [draft, setDraft] = useState<TierDraft>(() => tierDraftFromTier(tier));
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

    const validationError = validateTierUpdate(draft, issued);
    if (validationError) {
      setError(validationError);
      return;
    }

    const body = buildTierUpdateInput(initial, draft);
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await apiRequest<Tier>(`/tiers/${tier.id}`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      setError("We couldn’t save the tier. Please try again.");
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
        aria-labelledby="edit-tier-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Ticket tiers
            </p>
            <h2
              id="edit-tier-title"
              className="mt-1 font-display text-2xl font-bold"
            >
              Edit tier
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close edit tier"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {issued > 0 ? (
          <p className="mt-4 rounded-xl border-2 border-ink/15 bg-surface px-4 py-3 text-xs font-semibold text-ink-soft">
            {issued} ticket{issued === 1 ? "" : "s"} already issued — capacity
            can’t go below that.
          </p>
        ) : null}

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
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}
