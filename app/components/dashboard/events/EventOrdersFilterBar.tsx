"use client";

import { ORDER_STATUS_OPTIONS } from "@/app/lib/orders-query";
import type { OrderStatus } from "@/app/lib/types";
import { X } from "../../ui/icons";

const pill =
  "rounded-full border-2 border-ink px-3.5 py-1.5 text-xs font-semibold shadow-brutal-sm transition-all duration-300 ease-brutal hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none";

const label = "font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft";

/**
 * Status filter for the event order list, mapped to `GET /events/{eventId}/orders`.
 * Presentational — the section owns the filter state and resets to the first
 * page on every change.
 */
export default function EventOrdersFilterBar({
  status,
  hasFilter,
  onStatusChange,
  onClear,
}: {
  status?: OrderStatus;
  hasFilter: boolean;
  onStatusChange: (status?: OrderStatus) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-surface/90 p-3 shadow-brutal backdrop-blur-md sm:p-4">
      <div className="flex flex-wrap items-end gap-4 sm:gap-8">
        <div className="flex flex-col gap-2">
          <span className={label}>Status</span>
          <div
            role="group"
            aria-label="Order status"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={!status}
              onClick={() => onStatusChange(undefined)}
              className={`${pill} ${!status ? "bg-accent text-paper" : "bg-paper"}`}
            >
              All
            </button>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={status === option.value}
                onClick={() => onStatusChange(option.value)}
                className={`${pill} ${
                  status === option.value ? "bg-accent text-paper" : "bg-paper"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {hasFilter ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-4 py-2 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <X className="h-3.5 w-3.5" />
            Clear filter
          </button>
        ) : null}
      </div>
    </div>
  );
}
