"use client";

import { formatPrice } from "@/app/lib/format";
import type { CartItem } from "@/app/lib/cart";
import { Minus, Plus, Trash } from "../ui/icons";
import { useCart } from "./CartProvider";

const stepperButton =
  "flex h-7 w-7 items-center justify-center rounded-lg border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-300 ease-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

/** One cart line: the tier, a quantity stepper, its line total and remove. */
export default function CartItemRow({ item }: { item: CartItem }) {
  const { setQuantity, remove } = useCart();
  const lineTotal = item.price * item.quantity;

  return (
    <li className="flex items-start justify-between gap-3 rounded-2xl border-2 border-ink bg-paper p-3 shadow-brutal-sm">
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-bold">{item.tierName}</p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
          {formatPrice(item.price, item.priceUnit)} each
        </p>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setQuantity(item.eventId, item.tierId, item.quantity - 1)
            }
            aria-label={`Decrease ${item.tierName} quantity`}
            className={stepperButton}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span
            aria-live="polite"
            className="min-w-6 text-center font-display text-sm font-bold"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity(item.eventId, item.tierId, item.quantity + 1)
            }
            aria-label={`Increase ${item.tierName} quantity`}
            className={stepperButton}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-display text-base font-bold">
          {formatPrice(lineTotal, item.priceUnit)}
        </span>
        <button
          type="button"
          onClick={() => remove(item.eventId, item.tierId)}
          aria-label={`Remove ${item.tierName} from cart`}
          className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-ink bg-paper text-danger shadow-brutal-sm transition-all duration-300 ease-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          <Trash className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
