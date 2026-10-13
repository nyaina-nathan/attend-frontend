"use client";

import { useCart } from "../cart/CartProvider";
import type { EventStatus, Tier } from "@/app/lib/types";
import TierCard from "./TierCard";

/**
 * Purchase surface: the event's tier list. "Add to cart" drops a line into the
 * shared cart (navbar) and opens it; checkout is where the order is finalized.
 */
export default function TicketPanel({
  eventId,
  eventTitle,
  startTime,
  eventStatus,
  initialTiers,
  isAuthenticated,
  priceUnit,
}: {
  eventId: string;
  eventTitle: string;
  /** ISO UTC event start, carried into the cart for display. */
  startTime: string;
  eventStatus: EventStatus;
  initialTiers: Tier[];
  isAuthenticated: boolean;
  priceUnit: string;
}) {
  const { add, open, quantityOf } = useCart();

  const cancelled = eventStatus === "CANCELLED";

  function handleAdd(tier: Tier) {
    add({
      eventId,
      eventTitle,
      startTime,
      priceUnit,
      tierId: tier.id,
      tierName: tier.tierName,
      price: tier.price,
    });
    open();
  }

  return (
    <aside
      id="tickets"
      aria-label="Tickets"
      className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start"
    >
      <div className="rounded-3xl border-2 border-ink bg-surface p-5 shadow-brutal sm:p-6">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Tickets
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          {cancelled ? (
            <p className="rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
              Ticket sales are closed — this event was cancelled.
            </p>
          ) : null}

          {initialTiers.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-ink/30 px-4 py-8 text-center text-sm text-ink-soft">
              No tickets available yet.
            </p>
          ) : (
            initialTiers.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                priceUnit={priceUnit}
                disabled={cancelled}
                disabledReason={
                  cancelled ? "Ticket sales are closed" : undefined
                }
                inCart={quantityOf(eventId, tier.id)}
                onAdd={handleAdd}
              />
            ))
          )}

          {!isAuthenticated && initialTiers.length > 0 && !cancelled ? (
            <p className="text-xs text-ink-soft">
              You’ll be asked to log in when you check out.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
