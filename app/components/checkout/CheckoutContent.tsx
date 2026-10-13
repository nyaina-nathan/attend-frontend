"use client";

import Link from "next/link";
import { useState } from "react";
import type { Order } from "@/app/lib/types";
import { useCart } from "../cart/CartProvider";
import CheckoutEventForm from "./CheckoutEventForm";
import CheckoutSkeleton from "./CheckoutSkeleton";
import CheckoutSuccessCard from "./CheckoutSuccessCard";

interface PlacedOrder {
  order: Order;
  eventTitle: string;
  methodLabel: string | null;
}

/**
 * Checkout body. Reads the cart and renders one form per event; a placed order
 * is kept as a summary card and its event is dropped from the cart.
 */
export default function CheckoutContent() {
  const { groups, hydrated, removeEvent } = useCart();
  const [placed, setPlaced] = useState<PlacedOrder[]>([]);

  if (!hydrated) return <CheckoutSkeleton />;

  function handleOrdered(
    order: Order,
    eventTitle: string,
    methodLabel: string | null,
  ) {
    setPlaced((current) => [...current, { order, eventTitle, methodLabel }]);
    removeEvent(order.eventId);
  }

  if (groups.length === 0 && placed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-ink/40 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-ink-soft">
          Add tickets from an event to check out.
        </p>
        <Link
          href="/events"
          className="mt-2 inline-flex items-center rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Browse events
        </Link>
      </div>
    );
  }

  const placedEventIds = new Set(placed.map((entry) => entry.order.eventId));
  const pending = groups.filter((group) => !placedEventIds.has(group.eventId));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          Checkout
        </span>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Confirm your order
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft">
          Pick how you paid (or will pay) and add a reference so the organizer can
          match it.
        </p>
      </header>

      {placed.map((entry) => (
        <CheckoutSuccessCard
          key={entry.order.id}
          order={entry.order}
          eventTitle={entry.eventTitle}
          methodLabel={entry.methodLabel}
        />
      ))}

      {pending.map((group) => (
        <CheckoutEventForm
          key={group.eventId}
          group={group}
          onOrdered={handleOrdered}
        />
      ))}

      {pending.length === 0 && placed.length > 0 ? (
        <p className="text-sm text-ink-soft">All set — your cart is now empty.</p>
      ) : null}
    </div>
  );
}
