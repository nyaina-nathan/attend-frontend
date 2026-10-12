"use client";

import { formatPrice } from "@/app/lib/format";
import type { EventStatus, Tier } from "@/app/lib/types";

/**
 * Mobile-only sticky purchase bar. Scrolls to the ticket panel; shows a
 * disabled "Sold out" state instead of a buy action when nothing is left.
 */
export default function MobileTicketBar({
  eventStatus,
  tiers,
  priceUnit,
}: {
  eventStatus: EventStatus;
  tiers: Tier[];
  priceUnit: string;
}) {
  if (tiers.length === 0) return null;

  const cancelled = eventStatus === "CANCELLED";
  const available = tiers.some((tier) => tier.remaining > 0);
  const minPrice = Math.min(...tiers.map((tier) => tier.price));

  const label = cancelled
    ? "Ticket sales closed"
    : available
      ? `From ${formatPrice(minPrice, priceUnit)}`
      : "Sold out";

  const actionLabel = cancelled ? "Closed" : available ? "Get tickets" : "Sold out";
  const disabled = cancelled || !available;

  function scrollToTickets() {
    document
      .getElementById("tickets")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-5px_0_0_var(--color-ink)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            {label}
          </span>
          <span className="text-sm font-semibold">Tickets</span>
        </div>
        <button
          type="button"
          onClick={scrollToTickets}
          disabled={disabled}
          className="rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
