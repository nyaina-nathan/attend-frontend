import { getCurrentUser } from "@/app/lib/auth";
import EventsFilterBar from "./EventsFilterBar";

/**
 * Reads the current user (request-time, so it must render behind `<Suspense>`)
 * and hands the auth flag to the interactive filter bar.
 */
export default async function EventsToolbar() {
  const user = await getCurrentUser();
  return <EventsFilterBar isAuthenticated={Boolean(user)} />;
}
