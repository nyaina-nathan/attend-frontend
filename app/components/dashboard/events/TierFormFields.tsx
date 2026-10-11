"use client";

import type { RefObject } from "react";
import type { TierDraft } from "@/app/lib/create-event";

const inputClass =
  "w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/60 focus:border-accent";

/**
 * Shared `TierCreateRequest` / `TierUpdateRequest` fields (name, price,
 * capacity) used by both the create and edit tier dialogs. The optional `error`
 * is shown above the fields; `nameInputRef` lets a dialog focus the first input
 * on mount.
 */
export default function TierFormFields({
  draft,
  error,
  onChange,
  nameInputRef,
}: {
  draft: TierDraft;
  error: string | null;
  onChange: (patch: Partial<TierDraft>) => void;
  nameInputRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink">Name</span>
        <input
          ref={nameInputRef}
          type="text"
          name="tierName"
          value={draft.tierName}
          onChange={(event) => onChange({ tierName: event.target.value })}
          placeholder="General admission"
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink">Price</span>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={draft.price}
            onChange={(event) => onChange({ price: event.target.value })}
            placeholder="25.00"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink">Capacity</span>
          <input
            type="number"
            name="capacity"
            min="0"
            step="1"
            inputMode="numeric"
            value={draft.capacity}
            onChange={(event) => onChange({ capacity: event.target.value })}
            placeholder="100"
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}
