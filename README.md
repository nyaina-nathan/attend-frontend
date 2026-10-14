# Attend Front

The web frontend for **Attend**, an events & ticketing platform. Organizers create
events, define ticket tiers, sell tickets, and check guests in with a QR scan —
all from one dashboard. Attendees browse events, pick a tier, and check out.

The API this app talks to lives in a separate repository:
[`nyaina-nathan/attend-backend`](https://github.com/nyaina-nathan/attend-backend).

## Features

**For everyone**

- Browse public events and open an event page with its ticket tiers.
- Add tickets to a cart and check out, choosing among the event's payment methods.
- Personal ticket wallet: view tickets, see their status, and show each ticket's QR code.

**For organizers** (`/dashboard`, behind a login)

- An overview with tickets issued, checked in, and unit-less revenue, plus a
  reminder of pending orders.
- Create and edit events — date and time, location with a map point picker,
  visibility (public or invite-only), and a price unit.
- Manage multiple ticket tiers with live remaining capacity, so an event can
  never oversell.
- Payment methods per event.
- Collaborators: invite users to co-organize an event as admins through a
  consent-based invitation flow (accept or decline).
- Order management: review incoming orders and approve or refuse the pending ones.
- Attendee lists per event, with filters.
- Check guests in by scanning a ticket's QR code; each scan is atomic, so a
  ticket can't be checked in twice.

## Tech stack

| | |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, `cacheComponents`, `partialPrefetching`) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | [`jose`](https://github.com/panva/jose) for local JWT verification |
| Maps | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) |
| QR codes | [`qrcode.react`](https://github.com/zpao/qrcode.react) (display), [`@yudiel/react-qr-scanner`](https://github.com/yudielcurbelo/react-qr-scanner) (scan) |

## Architecture

### Two sides, one app

The Next.js App Router serves an unauthenticated public site and a session-guarded
organizer dashboard from the same codebase. Route groups keep their layouts apart:
`(auth)` for the login and register forms, `(checkout)` for the checkout flow, and
`dashboard/` for everything behind a login.

### API calls

Server components call the backend **directly** through `BACKEND_URL` (server-only).
Browser code calls a same-origin `/api/*` path (`NEXT_PUBLIC_API_URL=/api`), which
`next.config.ts` rewrites to the backend. Keeping browser traffic same-origin means
the auth cookies stay first-party — no cross-site cookie mode required for the client.

`app/lib/api.ts` wraps both: `apiFetch` throws on a non-2xx response, while
`apiRequest` returns the status and the API's machine-readable `error` code so
callers can branch (for example on `SOLD_OUT` or `EVENT_NOT_OPEN`).

### Authentication and session rotation

`proxy.ts` (Next.js 16's renamed middleware) runs before every non-asset request:

- The `access_token` JWT is verified **locally** against the backend's shared
  `JWT_SECRET`, so a valid session costs no network round trip.
- When the access token is missing or expired but a `refresh_token` cookie is
  present, the session is rotated through `POST /auth/refresh`. The backend's new
  `Set-Cookie` headers are forwarded to the browser **and** to the current render,
  so the page sees the caller as logged in immediately.
- On `/dashboard/**`, a failed rotation redirects to `/`. On public pages, the
  request simply renders as a guest and the cookies are left untouched.
- Speculative prefetches skip rotation, which would otherwise race with the real
  navigation and trip the backend's refresh-token reuse detection.

Both cookies are `HttpOnly`; there is no `Authorization` header anywhere in the app.

## Project structure

```
app/
├── (auth)/            # login and register, with their own layout
├── (checkout)/        # checkout flow
├── events/            # public event list and event detail ([eventId])
├── dashboard/         # organizer area: overview, events, orders, tickets, invitations
│   └── events/[eventId]/{,edit,orders}/   # event detail, edit, and per-event orders
├── components/        # UI grouped by feature
│   ├── landing/       # marketing page sections
│   ├── event/ orders/ tickets/ invitations/ dashboard/ scanner/ map/ site/
│   └── ui/            # shared primitives (Button, Section, QrCode, Pagination, …)
├── lib/               # data layer: one module per domain (events, orders, tickets, …)
├── globals.css
└── layout.tsx
docs/openapi.yaml      # the backend contract this app is built against
proxy.ts               # middleware: auth, session rotation
next.config.ts         # /api rewrite to the backend, Tailwind, cache options
```

`app/lib` is where API access lives. Most domain modules pair a server-oriented
fetch with client-side query helpers, and keep the TypeScript types for their
domain. Server-side reads use Next.js caching (`cacheComponents`); the current
user is cached privately per request so every component shares one lookup.

## Getting started

### Prerequisites

- **Node.js 24** (developed on 24.19)
- A running instance of [`attend-backend`](https://github.com/nyaina-nathan/attend-backend),
  with a PostgreSQL database.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `BACKEND_URL` | yes | Full backend base URL **including the `/api` prefix**, used by server components and `proxy.ts`. Example: `http://localhost:8080/api`. |
| `NEXT_PUBLIC_API_URL` | yes | Base URL browser code calls. Keep it as `/api` so it hits the same-origin rewrite. |
| `JWT_SECRET` | yes | Shared with the backend to verify access tokens locally. Must be the **same value** as the backend's `JWT_SECRET` and at least 32 ASCII characters. |

The backend serves its API under `/api` on port 8080 by default, so a local
`BACKEND_URL` looks like `http://localhost:8080/api`.

> Cookies over plain HTTP: the backend defaults to `COOKIE_SECURE=true` and
> `COOKIE_SAME_SITE=None`, which browsers only accept over HTTPS. For a local HTTP
> run, set `COOKIE_SECURE=false` and `COOKIE_SAME_SITE=Lax` on the backend and
> point its `CORS_ALLOWED_ORIGIN` at this app's origin.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack). |
| `npm run build` | Production build. |
| `npm run start` | Serve a production build. |
| `npm run lint` | Run ESLint. |

## API reference

The backend contract lives in [`docs/openapi.yaml`](./docs/openapi.yaml)
(OpenAPI 3.1). The backend repo also documents the authorization model and error
format in its [`docs/API.md`](https://github.com/nyaina-nathan/attend-backend/blob/main/docs/API.md).

A few conventions worth repeating:

- IDs are UUID strings; timestamps are ISO-8601 UTC.
- Money is a two-decimal string-safe number; each event carries its own
  free-form `priceUnit` that labels (never converts) every amount on it.
- Roles are **per event**, not global. The JWT carries identity only — role
  checks happen server-side in the backend's service layer.
- List endpoints are paginated (`page`/`size`, size 1–100) and return
  `{ content, page, size, totalElements, totalPages }`.

## Testing

This repository does not have an automated test suite yet. The backend repository
covers the API with unit tests and Testcontainers-based integration tests.
