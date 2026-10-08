/**
 * Sanitize a `redirect` search param down to a safe, same-origin path.
 *
 * Only single-leading-slash paths are allowed, which keeps the auth pages from
 * being used as an open redirect (`//evil.com`, `https://evil.com`,
 * `javascript:`, and backslash tricks all fall back to `/`).
 */
export function safeRedirect(
  value: string | string[] | undefined,
  fallback = "/",
): string {
  const target = Array.isArray(value) ? value[0] : value;
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }

  try {
    // Resolve against a throwaway origin and confirm it never escaped it.
    const url = new URL(target, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
