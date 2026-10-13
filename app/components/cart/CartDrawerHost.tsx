"use client";

import CartDrawer from "./CartDrawer";
import { useCart } from "./CartProvider";

/**
 * Single mount point for the cart drawer, rendered once in the root layout.
 * Any trigger (the navbar cart, "add to cart") opens it through the shared
 * provider, so there's exactly one overlay and one body-scroll lock.
 */
export default function CartDrawerHost() {
  const { isOpen, close } = useCart();
  return <CartDrawer open={isOpen} onClose={close} />;
}
