"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatEventDate, formatPrice } from "@/app/lib/format";
import { Cart as CartIcon, X } from "../ui/icons";
import CartItemRow from "./CartItemRow";
import { useCart } from "./CartProvider";

/**
 * Slide-over cart, opened from the navbar. Groups lines by event with a
 * per-event subtotal (a single grand total would mix currencies). Checkout is
 * intentionally inactive for now. Focus / Escape / body-scroll lock mirror the
 * app's other overlays.
 */
export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { groups, count, clear } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="presentation"
      onClick={onClose}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-ink/70" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onClick={(event) => event.stopPropagation()}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l-2 border-ink bg-surface shadow-brutal-xl"
      >
        <header className="flex items-center justify-between gap-4 border-b-2 border-ink px-5 py-4">
          <div className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            <h2 id="cart-title" className="font-display text-xl font-bold">
              Your cart
            </h2>
            {count > 0 ? (
              <span className="rounded-full border-2 border-ink bg-brand px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                {count} ticket{count === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {groups.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm">
                <CartIcon className="h-6 w-6 text-ink-soft" />
              </span>
              <p className="font-display text-lg font-bold">
                Your cart is empty
              </p>
              <p className="max-w-xs text-sm text-ink-soft">
                Browse an event and add tickets to see them here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((group) => (
                <section key={group.eventId} aria-label={group.eventTitle}>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-bold">
                        {group.eventTitle}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                        {formatEventDate(group.startTime)}
                      </p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-bold">
                      {formatPrice(group.subtotal, group.priceUnit)}
                    </span>
                  </div>

                  <ul className="mt-2 flex flex-col gap-2">
                    {group.items.map((item) => (
                      <CartItemRow key={item.tierId} item={item} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t-2 border-ink px-5 py-4">
          {groups.length > 0 ? (
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-full border-2 border-ink bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Checkout
            </Link>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full cursor-not-allowed rounded-full border-2 border-ink bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-brutal opacity-60"
            >
              Checkout
            </button>
          )}
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
              {count} ticket{count === 1 ? "" : "s"}
            </span>
            {groups.length > 0 ? (
              <button
                type="button"
                onClick={clear}
                className="text-xs font-semibold text-ink-soft underline-offset-2 transition-colors duration-300 ease-brutal hover:text-danger hover:underline"
              >
                Clear cart
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
