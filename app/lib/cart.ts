/**
 * Client-side cart model and pure helpers. The cart is local to the browser
 * (no API); it only remembers what the visitor intends to buy. Capacity and
 * pricing are still enforced by the API later, at checkout.
 */

export interface CartItem {
  eventId: string;
  eventTitle: string;
  /** ISO UTC start time, for display in the cart. */
  startTime: string;
  /** Currency/unit code applying to every amount in the group. */
  priceUnit: string;
  tierId: string;
  tierName: string;
  price: number;
  quantity: number;
}

/** One event's worth of cart lines, with its own subtotal. */
export interface CartGroup {
  eventId: string;
  eventTitle: string;
  startTime: string;
  priceUnit: string;
  items: CartItem[];
  subtotal: number;
}

export const CART_STORAGE_KEY = "attend.cart.v1";

/** Stable identity of a line item: one row per (event, tier). */
export function cartItemKey(item: Pick<CartItem, "eventId" | "tierId">): string {
  return `${item.eventId}:${item.tierId}`;
}

/** Add an item, incrementing quantity when the (event, tier) is already there. */
export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const key = cartItemKey(item);
  const index = items.findIndex((existing) => cartItemKey(existing) === key);
  if (index === -1) return [...items, item];

  return items.map((existing, i) =>
    i === index
      ? {
          ...existing,
          quantity: existing.quantity + item.quantity,
          // Refresh display metadata in case the event/tier changed.
          eventTitle: item.eventTitle,
          startTime: item.startTime,
          priceUnit: item.priceUnit,
          tierName: item.tierName,
          price: item.price,
        }
      : existing,
  );
}

export function removeItem(items: CartItem[], key: string): CartItem[] {
  return items.filter((item) => cartItemKey(item) !== key);
}

/** Drop every line for one event (used after its order is placed). */
export function removeCartEvent(items: CartItem[], eventId: string): CartItem[] {
  return items.filter((item) => item.eventId !== eventId);
}

/** Set an explicit quantity; anything below 1 removes the line. */
export function setQuantity(
  items: CartItem[],
  key: string,
  quantity: number,
): CartItem[] {
  if (quantity < 1) return removeItem(items, key);
  return items.map((item) =>
    cartItemKey(item) === key ? { ...item, quantity } : item,
  );
}

/** Total number of tickets in the cart (sum of quantities). */
export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/** Group lines by event, newest events first, each with a subtotal. */
export function groupByEvent(items: CartItem[]): CartGroup[] {
  const groups = new Map<string, CartGroup>();

  for (const item of items) {
    const existing = groups.get(item.eventId);
    if (existing) {
      existing.items.push(item);
      existing.subtotal += item.price * item.quantity;
      continue;
    }
    groups.set(item.eventId, {
      eventId: item.eventId,
      eventTitle: item.eventTitle,
      startTime: item.startTime,
      priceUnit: item.priceUnit,
      items: [item],
      subtotal: item.price * item.quantity,
    });
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0,
  );
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.eventId === "string" &&
    typeof item.eventTitle === "string" &&
    typeof item.startTime === "string" &&
    typeof item.priceUnit === "string" &&
    typeof item.tierId === "string" &&
    typeof item.tierName === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    item.quantity >= 1
  );
}

/** Read the persisted cart, dropping anything malformed. Never throws. */
export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

/** Persist the cart. Never throws (private mode / quota). */
export function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable; the in-memory cart still works for this session.
  }
}

/* ------------------------------------------------------------------- store */

export interface CartSnapshot {
  items: CartItem[];
  /** `false` until localStorage has been read on the client. */
  hydrated: boolean;
}

const EMPTY_ITEMS: CartItem[] = [];
const SERVER_SNAPSHOT: CartSnapshot = { items: EMPTY_ITEMS, hydrated: false };

/**
 * A tiny external store so components can read the cart with
 * `useSyncExternalStore`. The module keeps a stable snapshot object that only
 * changes on mutation, which keeps the subscription tear-free. localStorage is
 * read lazily on the client (never during render), so SSR and hydration both
 * see the empty server snapshot.
 */
let snapshot: CartSnapshot = SERVER_SNAPSHOT;
let initialized = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of Array.from(listeners)) listener();
}

function ensureInitialized(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  snapshot = { items: readCart(), hydrated: true };
}

function commit(items: CartItem[]): void {
  snapshot = { items, hydrated: true };
  writeCart(items);
  notify();
}

export function subscribeCart(listener: () => void): () => void {
  const before = snapshot;
  ensureInitialized();
  listeners.add(listener);
  // The first subscriber may have triggered the load; let React re-read.
  if (snapshot !== before) notify();
  return () => {
    listeners.delete(listener);
  };
}

export function getCartSnapshot(): CartSnapshot {
  return snapshot;
}

export function getCartServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

export function addCartItem(
  item: Omit<CartItem, "quantity">,
  quantity = 1,
): void {
  ensureInitialized();
  commit(addItem(snapshot.items, { ...item, quantity }));
}

export function removeCartItem(key: string): void {
  ensureInitialized();
  commit(removeItem(snapshot.items, key));
}

export function removeEventFromCart(eventId: string): void {
  ensureInitialized();
  commit(removeCartEvent(snapshot.items, eventId));
}

export function updateCartQuantity(key: string, quantity: number): void {
  ensureInitialized();
  commit(setQuantity(snapshot.items, key, quantity));
}

export function clearCart(): void {
  ensureInitialized();
  commit([]);
}
