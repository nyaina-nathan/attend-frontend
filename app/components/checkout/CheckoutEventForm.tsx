"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOrder,
  fetchEventPaymentMethods,
  paymentMethodLabel,
} from "@/app/lib/checkout";
import type { CartGroup } from "@/app/lib/cart";
import { formatEventDate, formatPrice } from "@/app/lib/format";
import type { Order, OrderCreateInput, PaymentMethod } from "@/app/lib/types";
import Field from "../auth/Field";

const inputClass =
  "w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/60 focus:border-accent";

function messageFor(status: number): string {
  if (status === 400) return "Please check the payment details and try again.";
  if (status === 409) {
    return "This event is no longer open, or that payment method can’t be used.";
  }
  if (status === 404) return "This event no longer exists.";
  return "We couldn’t place your order. Please try again.";
}

/**
 * Checkout section for a single event. Loads the event's payable methods, lets
 * the buyer choose one and add an optional transaction reference, then creates
 * a `PENDING` order. On success the parent swaps this form for a summary card.
 */
export default function CheckoutEventForm({
  group,
  onOrdered,
}: {
  group: CartGroup;
  onOrdered: (
    order: Order,
    eventTitle: string,
    methodLabel: string | null,
  ) => void;
}) {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchEventPaymentMethods(group.eventId)
      .then((res) => {
        if (!active) return;
        if (!res.ok || !res.data) {
          setMethodsError(
            "We couldn’t load the payment methods. Please try again.",
          );
          setMethods([]);
          return;
        }
        setMethods(res.data);
        if (res.data.length > 0) setSelectedId(res.data[0].id);
      })
      .catch(() => {
        if (!active) return;
        setMethodsError("We couldn’t load the payment methods. Please try again.");
        setMethods([]);
      });

    return () => {
      active = false;
    };
  }, [group.eventId]);

  const noMethods = methods !== null && methods.length === 0;

  async function submit() {
    if (submitting || !selectedId || noMethods) return;

    setSubmitting(true);
    setError(null);

    const input: OrderCreateInput = {
      paymentMethodId: selectedId,
      items: group.items.map((item) => ({
        tierId: item.tierId,
        quantity: item.quantity,
      })),
    };
    const trimmed = reference.trim();
    if (trimmed) input.transactionReference = trimmed;

    try {
      const res = await createOrder(group.eventId, input);

      if (!res.ok || !res.data) {
        if (res.status === 401) {
          router.replace("/login?next=/checkout");
          return;
        }
        setError(messageFor(res.status));
        return;
      }

      const method = methods?.find((item) => item.id === selectedId) ?? null;
      onOrdered(
        res.data,
        group.eventTitle,
        method ? paymentMethodLabel(method) : null,
      );
    } catch {
      setError("We couldn’t place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby={`checkout-event-${group.eventId}`}
      className="rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-sm sm:p-6"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <h2
            id={`checkout-event-${group.eventId}`}
            className="truncate font-display text-xl font-bold tracking-tight"
          >
            {group.eventTitle}
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            {formatEventDate(group.startTime)}
          </p>
        </div>
        <span className="shrink-0 font-display text-lg font-bold">
          {formatPrice(group.subtotal, group.priceUnit)}
        </span>
      </header>

      <ul className="mt-4 flex flex-col gap-2">
        {group.items.map((item) => (
          <li
            key={item.tierId}
            className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/15 bg-surface px-3 py-2 text-sm"
          >
            <span className="min-w-0 truncate font-semibold">
              {item.tierName}
            </span>
            <span className="shrink-0 font-mono text-xs text-ink-soft">
              {item.quantity} × {formatPrice(item.price, item.priceUnit)}
            </span>
            <span className="shrink-0 font-display text-sm font-bold">
              {formatPrice(item.price * item.quantity, item.priceUnit)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-4">
        {methods === null ? (
          <p className="text-sm text-ink-soft">Loading payment methods…</p>
        ) : methodsError ? (
          <p
            role="alert"
            className="rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
          >
            {methodsError}
          </p>
        ) : noMethods ? (
          <p className="rounded-xl border-2 border-warning bg-warning/10 px-4 py-3 text-sm font-semibold text-warning">
            This event isn’t accepting payments right now.
          </p>
        ) : (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">
              Payment method
            </span>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className={inputClass}
            >
              {methods?.map((method) => (
                <option key={method.id} value={method.id}>
                  {paymentMethodLabel(method)}
                </option>
              ))}
            </select>
          </label>
        )}

        <Field
          label="Transaction reference"
          name={`reference-${group.eventId}`}
          value={reference}
          maxLength={255}
          onChange={(event) => setReference(event.target.value)}
          placeholder="e.g. bank transfer reference"
          hint="Optional. Add the reference from your payment so the organizer can match it."
        />

        {error ? (
          <p
            role="alert"
            className="rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
          >
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={submitting || !selectedId || noMethods}
          className="self-start rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </div>
    </section>
  );
}
