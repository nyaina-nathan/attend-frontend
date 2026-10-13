/**
 * API base URLs.
 *
 * On the server, calls go straight to the backend (`BACKEND_URL`, server-only).
 * In the browser, calls go to a same-origin `/api/*` path that `next.config.ts`
 * rewrites to the backend, so auth cookies are first-party on our own domain.
 */
const SERVER_API_BASE = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");
const CLIENT_API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/$/,
  "",
);

function apiBase(): string {
  return typeof window === "undefined" ? SERVER_API_BASE : CLIENT_API_BASE;
}

/**
 * Thin JSON fetch wrapper around the Attend API.
 * Throws on a non-2xx response so callers can decide how to degrade.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  if (!base) {
    throw new Error("API base URL is not configured");
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} for ${path}`);
  }

  return (await res.json()) as T;
}

/** Non-throwing response shape, used where the HTTP status matters. */
export interface ApiResult<T> {
  status: number;
  ok: boolean;
  data?: T;
  /** Machine-readable `error` code from the API error body, when present. */
  errorCode?: string;
}

/**
 * Like {@link apiFetch}, but never throws on a non-2xx response: the caller
 * gets the status and the parsed `error` code so it can branch (401/403/404,
 * `SOLD_OUT`, `EVENT_NOT_OPEN`). Network/parse failures still throw.
 *
 * Safe to call from the browser as well as the server.
 */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const base = apiBase();
  if (!base) {
    throw new Error("API base URL is not configured");
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  const text = await res.text();
  let data: T | undefined;
  let errorCode: string | undefined;

  if (text) {
    try {
      const parsed = JSON.parse(text);
      if (res.ok) {
        data = parsed as T;
      } else if (parsed && typeof parsed.error === "string") {
        errorCode = parsed.error;
      }
    } catch {
      // Non-JSON body; status alone is enough.
    }
  }

  return { status: res.status, ok: res.ok, data, errorCode };
}
