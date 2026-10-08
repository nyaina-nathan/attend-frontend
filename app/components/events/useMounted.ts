"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` during SSR and the first client render, `true` after hydration.
 * Used to defer timezone-dependent formatting so server and client markup
 * match, without a `setState`-in-effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
