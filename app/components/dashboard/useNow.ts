"use client";

import { useMounted } from "../events/useMounted";

/**
 * Current timestamp on the client, `null` during SSR and the first render.
 *
 * Gated on {@link useMounted} so server and first client render agree; only the
 * post-mount render reads the clock. Labels derived from this (countdowns,
 * relative times) tolerate a few milliseconds of staleness.
 */
export function useNow(): number | null {
  const mounted = useMounted();
  return mounted ? new Date().getTime() : null;
}
