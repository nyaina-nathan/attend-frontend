const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/**
 * Thin JSON fetch wrapper around the Attend API.
 * Throws on a non-2xx response so callers can decide how to degrade.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} for ${path}`);
  }

  return (await res.json()) as T;
}
