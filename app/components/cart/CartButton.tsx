"use client";

import { Cart as CartIcon } from "../ui/icons";
import { useCart } from "./CartProvider";

/**
 * Navbar cart trigger with a live quantity badge. The badge only appears after
 * the cart hydrates, so the server render and first paint match. Opens the
 * shared cart drawer (mounted once via `CartDrawerHost`).
 */
export default function CartButton({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const { count, hydrated, open } = useCart();

  const label = hydrated && count > 0 ? `Cart, ${count} items` : "Cart";

  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      className={`relative flex shrink-0 items-center justify-center border-2 border-ink bg-paper text-ink shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${
        variant === "mobile"
          ? "h-11 w-11 rounded-xl"
          : "h-10 w-10 rounded-full"
      }`}
    >
      <CartIcon className="h-5 w-5" />
      {hydrated && count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-ink bg-accent px-1 font-mono text-[10px] font-bold leading-none text-paper">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
