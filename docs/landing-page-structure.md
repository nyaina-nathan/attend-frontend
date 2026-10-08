# Landing Page Structure (`/`)

Events & tickets app: public landing page that replaces the login page as the home route.

## Routing

| Route | Purpose |
|---|---|
| `/` | Landing page (this document) |
| `/login`, `/register` | Auth pages |
| `/events` | Full browsable list: search (`q`), date filters (`from`, `to`), pagination |
| `/events/[eventId]` | Event detail with tiers |

- If the visitor is already authenticated (`GET /users/me` succeeds), show the same landing page with the authenticated navbar, or redirect to a dashboard if preferred.

---

## 1. Navbar

- Logo
- Links: *Events*, *How it works*
- Logged out: *Log in*, *Sign up* (highlighted button)
- Logged in: *My tickets*, *My events*, avatar menu (profile, logout)

## 2. Hero

- Headline: "Create events. Sell tickets. Scan at the door."
- One sentence of subtext
- Primary CTA: *Browse events* (links to `/events`)
- Secondary CTA: *Create an event* (links to `/events/new` or `/register` if logged out)
- Visual: mock ticket card with a QR code, or a phone mockup of the ticket screen

## 3. Upcoming events (live data)

- Source: public `GET /events?size=6`
- 3 to 6 event cards, each showing: title, date, location, `minPrice` ("Free" when `0.00`)
- "See all events" link to `/events`
- Empty state when there are no events yet
- Fetch in a Server Component, revalidate every minute or so

## 4. How it works

Two tabs or a toggle:

**Attendees**
1. Find an event
2. Pick a tier
3. Get your QR ticket

**Organizers**
1. Create an event
2. Add tiers and teammates
3. Scan tickets at the door

## 5. Feature highlights

Grid of 4 to 6 cards:

- **QR tickets and instant check-in**: atomic, no double scans
- **Multiple ticket tiers**: live remaining capacity, no overselling
- **Team roles per event**: creator and admins
- **Public or private events**
- **Organizer dashboard**: tickets issued, checked in, revenue
- **Secure sessions**: HttpOnly cookies, refresh token rotation

## 6. Organizer spotlight

- Screenshot or mock of the stats dashboard (`GET /events/{eventId}/stats`)
- Short pitch for organizers
- CTA: *Start organizing*

## 7. About this project (optional, portfolio)

- Stack strip: Spring Boot, PostgreSQL, Next.js
- Link to the GitHub repository
- Link to the API documentation

## 8. Final CTA and footer

- CTA: *Create your first event*
- Footer: GitHub, contact, copyright

---

## Implementation notes

- **Priority order**: sections 1, 2, 3 and 5 give a strong page on their own. Add the rest later.
- **Demo mode**: a "Try the demo" button that logs in with a seeded demo account, or a few seeded events, so reviewers can see something without registering.
- **Reusable components**: `TicketCard` (with real QR code via `qrcode.react`), `EventCard`, `FeatureCard`, `Navbar`, `Footer`. `TicketCard` is reused on the "My tickets" page.
- **Data fetching**: only section 3 needs the API; everything else is static content.
