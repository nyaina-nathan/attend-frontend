# Build instructions: Event page (`/events/[eventId]`)

Goal: build the event detail page of the Events & Tickets app (Next.js App Router, TypeScript). It shows one event, its ticket tiers, lets a logged-in user get a ticket, and exposes organizer actions to people with a role on the event.

Backend contract: see `API.md`. Relevant endpoints:

- `GET /events/{eventId}` (public, with visibility rules)
- `GET /events/{eventId}/tiers` (same visibility as the event)
- `POST /tiers/{tierId}/tickets` (auth required)
- `GET /users/me` (to know whether the visitor is authenticated)

Do not touch design tokens, fonts or colors here. Use the project's existing styling setup.

---

## 1. Files to create

```
app/events/[eventId]/
  page.tsx              # Server Component: fetch + render
  loading.tsx           # Skeletons
  not-found.tsx         # 404 state
components/event/
  StatusBanner.tsx
  EventHeader.tsx
  EventInfo.tsx
  OrganizerBar.tsx
  TicketPanel.tsx       # Client Component
  TierCard.tsx          # Client Component
  MobileTicketBar.tsx   # Client Component
  AccessState.tsx       # 401 / 403 full-page states
lib/
  api.ts                # server-side fetch helper that forwards cookies
types/
  event.ts
```

Reuse the existing `TicketCard` (QR code via `qrcode.react`) for the post-purchase confirmation.

---

## 2. Types (`types/event.ts`)

```ts
export type EventStatus = "OK" | "CANCELLED" | "POSTPONED";
export type EventRole = "CREATOR" | "ADMIN" | null;

export interface Tier {
  id: string;
  tierName: string;
  price: number;
  capacity: number;
  remaining: number;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  startTime: string; // ISO UTC
  endTime: string;   // ISO UTC
  isPublic: boolean;
  location: string | null;
  status: EventStatus;
  myRole: EventRole;
  tiers: Tier[];
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  event: { id: string; title: string; startTime: string; location: string | null };
  tier: { id: string; tierName: string };
  pricePaid: number;
  ticketStatus: "VALID" | "USED" | "CANCELLED" | "REFUNDED";
  checkedInAt: string | null;
  validUntil: string | null;
  createdAt: string;
}
```

---

## 3. Data fetching (`page.tsx`, Server Component)

1. Read the incoming cookies with `cookies()` from `next/headers` and forward them to the API (`Cookie` header). Without this, private events and `myRole` will not work for organizers.
2. Call `GET /events/{eventId}` with `cache: "no-store"` (or `next: { revalidate: 10 }` at most), because `remaining` changes quickly.
3. Map the response status:
   - `200`: render the page.
   - `401`: render `<AccessState kind="login" redirect={`/events/${eventId}`} />`.
   - `403`: render `<AccessState kind="forbidden" />`.
   - `404`: call `notFound()`.
   - anything else: throw, so the nearest `error.tsx` handles it.
4. Also determine whether the visitor is authenticated (call `GET /users/me` with the same cookies, or infer it from the presence of the `access_token` cookie). Pass `isAuthenticated` down to the Client Components.
5. Set `generateMetadata` using the title and a trimmed description for the page title and Open Graph tags. For private events, return minimal metadata.

---

## 4. Layout

Desktop: two columns inside a centered container.

- Left, about 2/3: `StatusBanner` (above everything), `OrganizerBar` (if `myRole`), `EventHeader`, `EventInfo`.
- Right, about 1/3: `TicketPanel`, `position: sticky` with a small top offset.

Mobile: single column, `TicketPanel` rendered after the info, plus a fixed `MobileTicketBar` at the bottom of the viewport. Add bottom padding to the page so content is never hidden behind the bar.

---

## 5. Components

### 5.1 `StatusBanner`

Props: `status`, `startTime`, `endTime`.

- `CANCELLED`: "This event has been cancelled."
- `POSTPONED`: "This event has been postponed." Show the current (new) dates from the event.
- `OK`: render nothing.

### 5.2 `EventHeader`

Props: event.

- Title as the page `h1`.
- Date and time range, formatted in the **visitor's local timezone** with `Intl.DateTimeFormat`. If start and end fall on the same day, show the date once with a time range. Because the server and the browser may differ in timezone, format inside a small Client Component (or use `suppressHydrationWarning` on the formatted text) to avoid hydration mismatches.
- Location, if present.
- "Private" badge when `isPublic === false`.
- Banner area at the top: no image field exists in the schema, so generate a placeholder from the event id (for example a deterministic gradient or pattern seeded by the id).

### 5.3 `EventInfo`

- **About** section: render `description` as plain text, preserving line breaks. If null, show an empty state such as "The organizer hasn't added a description yet."
- **Date and location** block: start, end, venue. Add an "Add to calendar" link that downloads a generated `.ics` file (title, start, end, location). Leave a clearly marked spot for a future map link.

### 5.4 `TicketPanel` (Client Component)

Props: `eventId`, `eventStatus`, `initialTiers`, `isAuthenticated`.

State: `tiers`, `loadingTierId`, `purchasedTicket`, `message`.

Rendering:

- One `TierCard` per tier.
- If the event status is `CANCELLED`, disable every button and show "Ticket sales are closed".
- If there are no tiers, show "No tickets available yet."
- If `purchasedTicket` is set, replace the tier list with the success state: a confirmation message, the `TicketCard` with the QR code, and a link to `/tickets` ("My tickets"). Provide a "Get another ticket" button that returns to the tier list.

### 5.5 `TierCard` (Client Component)

Props: `tier`, `disabled`, `loading`, `onGet`.

- Tier name.
- Price: "Free" when `price === 0`, otherwise formatted with 2 decimals (single currency for now).
- Availability:
  - `remaining === 0`: "Sold out", button disabled.
  - `remaining <= 10`: urgency hint such as "Only {remaining} left".
  - otherwise: "{remaining} left".
- **Get ticket** button with a loading state. Disabled when sold out, when the event is cancelled, or while any purchase is in flight.

### 5.6 `OrganizerBar`

Rendered only when `myRole !== null`. Links:

| Action | Visible to | Target |
|---|---|---|
| Edit event | CREATOR | `/events/{id}/edit` |
| Manage tiers | CREATOR, ADMIN | `/events/{id}/tiers` |
| Attendees | CREATOR, ADMIN | `/events/{id}/attendees` |
| Stats | CREATOR, ADMIN | `/events/{id}/stats` |
| Scan tickets | CREATOR, ADMIN | `/events/{id}/scan` |
| Team | CREATOR, ADMIN (read), CREATOR (add/remove) | `/events/{id}/team` |
| Cancel event | CREATOR | opens a confirmation dialog, then `POST /events/{id}/cancel` |

Notes:

- The cancel dialog must explain that tickets are left as-is and can be refunded individually. On success, refresh the page (`router.refresh()`).
- This is UX only; the backend enforces the real permissions.

### 5.7 `MobileTicketBar`

- Shows "From $X" (lowest tier price, "Free" if the minimum is 0) and a button.
- The button scrolls to the `TicketPanel` (or opens it in a bottom sheet if one already exists in the project).
- Hidden on desktop and hidden when the event is cancelled or all tiers are sold out (show "Sold out" instead).

### 5.8 `AccessState`

Full-page replacements, centered:

- `login` (401): "Log in to view this event" with a button to `/login?redirect=/events/{id}`.
- `forbidden` (403): "You don't have access to this event" with a link back to `/events`.
- `not-found.tsx` (404): "Event not found" with a link back to `/events`.

---

## 6. Purchase flow (inside `TicketPanel`)

```
onGet(tier):
  if (!isAuthenticated)
      router.push(`/login?redirect=/events/${eventId}`); return

  setLoadingTierId(tier.id)
  res = POST /tiers/{tier.id}/tickets   (credentials: "include", empty body)

  201 -> setPurchasedTicket(await res.json()); refetch tiers
  401 -> try POST /auth/refresh once, then retry; if still 401, redirect to login
  409 SOLD_OUT       -> refetch tiers, message: "Sorry, this tier just sold out."
  409 EVENT_NOT_OPEN -> message: "This event is no longer open."
  400/404/other      -> generic error message with a retry option

  finally setLoadingTierId(null)
```

Rules:

- Block double clicks: while a purchase is in flight, disable all Get ticket buttons.
- Refetch tiers client-side with `GET /events/{eventId}/tiers` after every purchase attempt (success or failure) so `remaining` is fresh.
- Parse the error body using the API's error format (`error` code field) rather than matching on message text.
- After login, the `redirect` parameter on `/login` must bring the user back to this page. Make sure the login page validates that `redirect` is a relative path to avoid open redirects.

---

## 7. Loading, errors, accessibility

- `loading.tsx`: skeleton for the header, the info block and 2 to 3 tier cards.
- `error.tsx`: friendly message with a Retry button (`reset()`).
- Use semantic landmarks (`main`, `section` with headings). Buttons that are disabled because of sold out or cancelled must also expose the reason as text, not only through the disabled state.
- The success state and error messages should be announced with `aria-live="polite"`.
- Keep the bottom sheet / scroll behavior keyboard accessible.

---

## 8. Acceptance checklist

- [ ] Public event renders for an anonymous visitor, with tiers and remaining counts.
- [ ] Dates are shown in the visitor's local timezone with no hydration warnings.
- [ ] Cancelled event shows the banner and every purchase button is disabled.
- [ ] Postponed event shows the banner with the updated dates.
- [ ] Anonymous click on Get ticket redirects to login and returns to the same event afterwards.
- [ ] Authenticated purchase shows the QR `TicketCard` and a link to My tickets.
- [ ] Simulated `409 SOLD_OUT` refreshes the tiers and shows the message.
- [ ] Simulated `409 EVENT_NOT_OPEN` shows "This event is no longer open."
- [ ] Private event: anonymous gets the login state, non-organizer gets the forbidden state, organizer sees the page.
- [ ] Unknown id shows the 404 page.
- [ ] Organizer bar shows the right actions for CREATOR vs ADMIN and nothing for other users.
- [ ] Cancel event requires confirmation and refreshes the page on success.
- [ ] Mobile: bottom bar is visible, does not hide content, and scrolls to the tiers.
- [ ] `remaining` is never served from a long-lived cache.