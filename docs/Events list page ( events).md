# Events list page (`/events`)

Full browsable catalogue behind the landing page's "See all events" link. It is driven entirely by `GET /events`, and the URL holds all the state so that any search can be shared or bookmarked.

## 1. Page header

- Title: "Events"
- Short subtext, e.g. "Find something happening near you."
- If authenticated: a *Create an event* button on the right.

## 2. Search and filters bar

Sits just under the header and sticks to the top while scrolling on desktop.

- **Search input** (`q`): debounced by about 300 ms, with a clear button.
- **Date range** (`from`, `to`): a date-range picker with quick presets such as *Today*, *This weekend*, *This month*.
- **Status** (`status`): defaults to `OK`. A small dropdown can also offer *Postponed* and *Cancelled*, so people can still find those events.
- **Sort** (`sort`): *Soonest first* (default `startTime,asc`) and *Latest first*.
- **My events toggle** (`isMine`): shown only to authenticated users. When on, it reveals a secondary *Public / Private / All* control (`isPublic`) so organizers can see their private events too.
- A *Reset filters* link, shown only when a filter is active.

On mobile, the search input stays visible and the other filters collapse into a *Filters* button that opens a bottom sheet with an *Apply* button.

## 3. Active filter chips

Under the bar, one removable chip per active filter (e.g. "Jazz ✕", "Nov 1 – Nov 30 ✕"), and a results count (`totalElements`): "24 events".

## 4. Results grid

- 3 columns on desktop, 2 on tablet, 1 on mobile.
- Reuse `EventCard` from the landing page: title, date, location, `minPrice` ("Free" when `0.00`).
- Add a small status badge on the card when `status` is `CANCELLED` or `POSTPONED`, and a "Private" badge in `isMine` mode.
- The whole card links to `/events/[eventId]`.

## 5. Pagination

- Numbered pages with previous/next, driven by `page`, `size` and `totalPages`.
- A "Load more" button is a good mobile alternative. Pick one pattern, since mixing them complicates the URL state.
- Hide the control when there is only one page.
- Scroll back to the top of the results on page change.

## 6. States

- **Loading**: skeleton cards that match the grid, not a full-page spinner.
- **Empty, no filters**: "No events yet", with a *Create an event* call to action.
- **Empty, with filters**: "No events match your search", with a *Reset filters* button.
- **Error**: a friendly message and a *Retry* button.
- **Anonymous with `isMine` in the URL**: ignore it silently (the API does too) and show the public listing.

## Implementation notes

- **URL as source of truth**: sync `q`, `from`, `to`, `status`, `isMine`, `isPublic`, `page`, `size` and `sort` to the query string. Reset `page` to 0 whenever any other filter changes.
- **Rendering split**: the page is a Server Component that reads `searchParams` and fetches the first result set, so it is fast and indexable. The filter bar is a Client Component that updates the URL with `router.replace`, which triggers a new server render.
- **Cookies**: forward them on the server fetch, otherwise `isMine` will not take effect for authenticated users.
- **Caching**: public listings can use a short revalidate (about a minute). Requests with `isMine` should not be cached.
- **Dates**: send `from`/`to` as UTC ISO strings, but let the user pick them in their local timezone.
- **Components to build**: `EventsFilterBar`, `FilterChips`, `EventGrid`, `Pagination`, `EmptyState`, plus the existing `EventCard`.
