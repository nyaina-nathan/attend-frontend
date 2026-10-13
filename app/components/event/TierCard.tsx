"use client";

import { formatPrice } from "@/app/lib/format";
import type { Tier } from "@/app/lib/types";

/**
 * One purchasable tier with price, availability and an Add-to-cart button.
 * `disabledReason` is surfaced as text so the disabled state isn't the only cue.
 */
export default function TierCard({
  tier,
  priceUnit,
  disabled,
  disabledReason,
  inCart = 0,
  onAdd,
}: {
  tier: Tier;
  priceUnit: string;
  disabled: boolean;
  disabledReason?: string;
  /** Quantity of this tier already in the cart. */
  inCart?: number;
  onAdd: (tier: Tier) => void;
}) {
  const soldOut = tier.remaining === 0;
  const urgency = !soldOut && tier.remaining <= 10;

  const availability = soldOut
    ? "Sold out"
    : urgency
      ? `Only ${tier.remaining} left`
      : `${tier.remaining} left`;

  const buttonDisabled = disabled || soldOut;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-ink bg-paper p-4 shadow-brutal-sm">
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold">
          {tier.tierName}
        </p>
        <p
          className={`mt-1 font-mono text-[10px] uppercase tracking-wider ${
            soldOut ? "text-danger" : urgency ? "text-warning" : "text-ink-soft"
          }`}
        >
          {availability}
        </p>
        {inCart > 0 ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-accent">
            {inCart} in cart
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-display text-lg font-bold">
          {formatPrice(tier.price, priceUnit)}
        </span>
        <button
          type="button"
          onClick={() => onAdd(tier)}
          disabled={buttonDisabled}
          aria-disabled={buttonDisabled}
          className="rounded-full border-2 border-ink bg-accent px-4 py-2 text-xs font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm"
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
        {disabledReason ? (
          <span className="text-right text-[10px] text-ink-soft">
            {disabledReason}
          </span>
        ) : null}
      </div>
    </div>
  );
}
