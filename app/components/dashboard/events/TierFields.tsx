"use client";

import type { TierDraft } from "@/app/lib/create-event";
import { Plus, X } from "../../ui/icons";

const inputClass =
  "w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/60 focus:border-accent";

/** Step 2 of the create-event wizard: 0..N `TierCreateRequest` rows. */
export default function TierFields({
  tiers,
  errors,
  onChange,
  onAdd,
  onRemove,
}: {
  tiers: TierDraft[];
  errors: Record<number, string>;
  onChange: (index: number, patch: Partial<TierDraft>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="mt-5 flex flex-col gap-4">
      <p className="rounded-2xl border-2 border-ink/15 bg-surface px-4 py-3 text-xs font-semibold text-ink-soft">
        Events with no ticket tier stay private — only you can see them.
      </p>

      {tiers.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-ink/30 px-4 py-8 text-center text-sm text-ink-soft">
          No tiers yet. Add one to start selling, or create the event without
          tiers.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tiers.map((tier, index) => (
            <li
              key={index}
              className="rounded-2xl border-2 border-ink bg-paper p-3 shadow-brutal-sm"
            >
              <div className="flex items-start gap-2">
                <div className="grid flex-1 gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-ink">Name</span>
                    <input
                      type="text"
                      value={tier.tierName}
                      onChange={(event) =>
                        onChange(index, { tierName: event.target.value })
                      }
                      placeholder="General admission"
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-ink">Price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={tier.price}
                      onChange={(event) =>
                        onChange(index, { price: event.target.value })
                      }
                      placeholder="25.00"
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-ink">
                      Capacity
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={tier.capacity}
                      onChange={(event) =>
                        onChange(index, { capacity: event.target.value })
                      }
                      placeholder="100"
                      className={inputClass}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove tier ${index + 1}`}
                  className="mt-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <X className="h-4 w-4 text-danger" />
                </button>
              </div>

              {errors[index] ? (
                <p role="alert" className="mt-2 text-xs font-semibold text-danger">
                  {errors[index]}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 self-start rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        <Plus className="h-4 w-4" />
        Add tier
      </button>
    </div>
  );
}
