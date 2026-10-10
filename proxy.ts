import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (Next.js 16's renamed middleware) around authentication.
 *
 * Public routes (`/`, `/events`, …) are never checked, with one exception:
 * `/login` and `/register` are the auth forms, so a visitor who still holds a
 * session is sent straight to `/dashboard` instead of seeing them.
 *
 * For `/dashboard/**` the `access_token` JWT is verified locally against the
 * backend's shared secret. When it is missing or expired, the session is
 * rotated through `POST /auth/refresh` with the `refresh_token` cookie: the
 * backend's new `Set-Cookie` headers are forwarded to the browser and to the
 * current render. If rotation fails the caller is sent to `/`.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const JWT_SECRET = process.env.JWT_SECRET;
const encodedSecret = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

/** Auth forms an authenticated visitor should skip. */
const AUTH_PATHS = new Set(["/login", "/register"]);

/** Routes that require a valid session. */
function isProtectedPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

/**
 * Prefetch requests are speculative. Rotating the refresh token for them can
 * race with the real navigation and trip the backend's reuse detection (which
 * revokes the whole token chain), so they are allowed to pass through.
 */
function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.get("next-router-prefetch") !== null ||
    request.headers.get("purpose") === "prefetch"
  );
}

async function isAccessTokenValid(token: string | undefined): Promise<boolean> {
  if (!token || !encodedSecret) return false;
  try {
    await jwtVerify(token, encodedSecret, {
      algorithms: ["HS256", "HS384", "HS512"],
    });
    return true;
  } catch {
    return false;
  }
}

/** `Headers.getSetCookie`, with a fallback for runtimes without it. */
function getSetCookies(headers: Headers): string[] {
  const withSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof withSetCookie.getSetCookie === "function") {
    return withSetCookie.getSetCookie();
  }
  const header = headers.get("set-cookie");
  return header ? [header] : [];
}

/** Pull the `name=value` pair out of a raw `Set-Cookie` header. */
function cookiePair(raw: string): [string, string] | null {
  const semi = raw.indexOf(";");
  const pair = semi === -1 ? raw : raw.slice(0, semi);
  const eq = pair.indexOf("=");
  if (eq <= 0) return null;
  return [pair.slice(0, eq).trim(), pair.slice(eq + 1).trim()];
}

/** Result of a successful token rotation. */
interface Rotation {
  /** Raw `Set-Cookie` headers from the backend, ready to forward. */
  setCookies: string[];
  /** Request headers rebuilt with the new cookies for the current render. */
  requestHeaders: Headers;
}

/** Exchange the refresh token for a fresh access/refresh cookie pair. */
async function rotateSession(request: NextRequest): Promise<Rotation | null> {
  if (!API_BASE) return null;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        accept: "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const setCookies = getSetCookies(res.headers);

  // Rebuild the request cookie header so the current render sees the new token.
  const cookies = new Map<string, string>();
  for (const { name, value } of request.cookies.getAll()) {
    cookies.set(name, value);
  }
  for (const raw of setCookies) {
    const pair = cookiePair(raw);
    if (pair) cookies.set(pair[0], pair[1]);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "cookie",
    Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; "),
  );

  return { setCookies, requestHeaders };
}

/** Forward the backend's rotated cookies onto our own response. */
function applySetCookies(response: NextResponse, setCookies: string[]): void {
  for (const raw of setCookies) {
    response.headers.append("set-cookie", raw);
  }
}

/** Drop the now-useless auth cookies from an outgoing response. */
function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}

/**
 * A visitor who already holds a session should not see the auth forms: send
 * them to the dashboard. A locally valid access token short-circuits without a
 * network call; otherwise the refresh token is rotated and the fresh cookies
 * are attached to the redirect, since the backend revokes the old ones.
 * Anything else renders the page as a guest and drops stale cookies.
 */
async function handleAuthPage(request: NextRequest): Promise<NextResponse> {
  // Don't rotate for speculative prefetches; the real navigation will.
  if (isPrefetch(request)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (await isAccessTokenValid(accessToken)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (request.cookies.has(REFRESH_COOKIE)) {
    const rotation = await rotateSession(request);
    if (rotation) {
      const response = NextResponse.redirect(new URL("/dashboard", request.url));
      applySetCookies(response, rotation.setCookies);
      return response;
    }
  }

  const response = NextResponse.next();
  if (
    request.cookies.has(ACCESS_COOKIE) ||
    request.cookies.has(REFRESH_COOKIE)
  ) {
    clearAuthCookies(response);
  }
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Public pages: no auth work…
  if (!isProtectedPath(pathname)) {
    // …except the auth forms, which an authenticated visitor should skip.
    if (!AUTH_PATHS.has(pathname)) {
      return NextResponse.next();
    }
    return handleAuthPage(request);
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (await isAccessTokenValid(accessToken)) {
    return NextResponse.next();
  }

  // Don't rotate for speculative prefetches; the real request will.
  if (isPrefetch(request)) {
    return NextResponse.next();
  }

  if (request.cookies.has(REFRESH_COOKIE)) {
    const rotation = await rotateSession(request);
    if (rotation) {
      const response = NextResponse.next({
        request: { headers: rotation.requestHeaders },
      });
      applySetCookies(response, rotation.setCookies);
      return response;
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
