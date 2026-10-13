"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  addCartItem,
  cartCount,
  cartItemKey,
  clearCart as clearStore,
  getCartServerSnapshot,
  getCartSnapshot,
  groupByEvent,
  removeCartItem,
  removeEventFromCart,
  subscribeCart,
  updateCartQuantity,
  type CartGroup,
  type CartItem,
} from "@/app/lib/cart";

interface CartContextValue {
  items: CartItem[];
  groups: CartGroup[];
  count: number;
  /** `false` during SSR and the first render, `true` once localStorage is read. */
  hydrated: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (eventId: string, tierId: string) => void;
  /** Drop every line for one event (after its order is placed). */
  removeEvent: (eventId: string) => void;
  setQuantity: (eventId: string, tierId: string, quantity: number) => void;
  clear: () => void;
  quantityOf: (eventId: string, tierId: string) => number;
  /** Drawer visibility, shared so "add to cart" can open it. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Exposes the localStorage-backed cart (see `app/lib/cart.ts`) to the app. The
 * data lives in an external store read through `useSyncExternalStore`, so the
 * server render and first client paint stay empty and in sync; only the drawer
 * visibility is local React state. Wrapped around the app in the root layout.
 */
export default function CartProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) =>
      addCartItem(item, quantity),
    [],
  );

  const remove = useCallback(
    (eventId: string, tierId: string) =>
      removeCartItem(cartItemKey({ eventId, tierId })),
    [],
  );

  const removeEvent = useCallback(
    (eventId: string) => removeEventFromCart(eventId),
    [],
  );

  const setQuantity = useCallback(
    (eventId: string, tierId: string, quantity: number) =>
      updateCartQuantity(cartItemKey({ eventId, tierId }), quantity),
    [],
  );

  const clear = useCallback(() => clearStore(), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: snapshot.items,
      groups: groupByEvent(snapshot.items),
      count: cartCount(snapshot.items),
      hydrated: snapshot.hydrated,
      add,
      remove,
      removeEvent,
      setQuantity,
      clear,
      quantityOf: (eventId, tierId) => {
        const found = snapshot.items.find(
          (item) => item.eventId === eventId && item.tierId === tierId,
        );
        return found?.quantity ?? 0;
      },
      isOpen,
      open,
      close,
    }),
    [snapshot, isOpen, add, remove, removeEvent, setQuantity, clear, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access the cart. Must be called inside `<CartProvider>`. */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
