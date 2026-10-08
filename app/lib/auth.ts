import { cacheLife } from "next/cache";
import { cookies } from "next/headers";
import { apiFetch } from "./api";
import type { CurrentUser } from "./types";

/**
 * Cookie header for API calls that need the caller's identity (e.g. `isMine`).
 * Returns `undefined` when the request carries no auth cookies.
 */
export async function getAuthCookieHeader(): Promise<string | undefined> {
  const store = await cookies();
  const parts: string[] = [];

  const access = store.get("access_token")?.value;
  if (access) parts.push(`access_token=${access}`);

  const refresh = store.get("refresh_token")?.value;
  if (refresh) parts.push(`refresh_token=${refresh}`);

  return parts.length > 0 ? parts.join("; ") : undefined;
}

/**
 * Current authenticated user, or `null` for anonymous callers.
 *
 * Cached privately (`use cache: private`) so every component in the same
 * request shares one lookup, without ever touching the server cache. Reads the
 * request cookies, so callers must render behind a `<Suspense>` boundary.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  "use cache: private";
  cacheLife({ stale: 300 });

  const cookie = await getAuthCookieHeader();
  if (!cookie) return null;

  try {
    return await apiFetch<CurrentUser>("/users/me", { headers: { cookie } });
  } catch {
    return null;
  }
}
