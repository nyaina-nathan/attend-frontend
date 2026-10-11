"use client";

import { TICKET_STATUS_OPTIONS } from "@/app/lib/tickets-query";
import type { TicketStatus } from "@/app/lib/types";
import { Search, X } from "../../ui/icons";

const pill =
  "rounded-full border-2 border-ink px-3.5 py-1.5 text-xs font-semibold shadow-brutal-sm transition-all duration-300 ease-brutal hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none";

const label = "font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft";

/**
 * Filters for the attendee list, mapped to `GET /events/{eventId}/tickets`:
 * `q` (name/username search), `status` and `tierId`. Presentational — the
 * section owns the filter state and resets to the first page on every change.
 */
export default function AttendeesFilterBar({
  term,
  status,
  tierId,
  tiers,
  hasFilters,
  onTermChange,
  onStatusChange,
  onTierChange,
  onClear,
}: {
  term: string;
  status?: TicketStatus;
  tierId: string;
  tiers: { id: string; tierName: string }[];
  hasFilters: boolean;
  onTermChange: (value: string) => void;
  onStatusChange: (status?: TicketStatus) => void;
  onTierChange: (tierId: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-surface/90 p-3 shadow-brutal backdrop-blur-md sm:p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="flex flex-col gap-2 lg:w-64">
          <label htmlFor="attendee-search" className={label}>
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              id="attendee-search"
              type="text"
              value={term}
              onChange={(event) => onTermChange(event.target.value)}
              placeholder="Name or username"
              autoComplete="off"
              className="w-full rounded-full border-2 border-ink bg-paper py-2 pl-10 pr-4 text-sm text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/70 focus:border-accent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={label}>Status</span>
          <div
            role="group"
            aria-label="Attendee ticket status"
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
            {TICKET_STATUS_OPTIONS.map((option) => (
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

        <div className="flex flex-col gap-2">
          <label htmlFor="attendee-tier" className={label}>
            Tier
          </label>
          <select
            id="attendee-tier"
            value={tierId}
            onChange={(event) => onTierChange(event.target.value)}
            className="rounded-xl border-2 border-ink bg-paper px-3.5 py-2 text-sm font-semibold text-ink outline-none transition-colors duration-300 ease-brutal focus:border-accent"
          >
            <option value="">All tiers</option>
            {tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.tierName}
              </option>
            ))}
          </select>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-4 py-2 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
