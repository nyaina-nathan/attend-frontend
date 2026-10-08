import type { Metadata } from "next";
import { Suspense } from "react";
import CreateEventButton from "@/app/components/events/CreateEventButton";
import EventsHeader from "@/app/components/events/EventsHeader";
import EventsResults from "@/app/components/events/EventsResults";
import EventsSkeleton, { FilterBarSkeleton } from "@/app/components/events/EventsSkeleton";
import EventsToolbar from "@/app/components/events/EventsToolbar";
import Footer from "@/app/components/site/Footer";
import Navbar from "@/app/components/site/Navbar";
import type { RawSearchParams } from "@/app/lib/events-query";

export const metadata: Metadata = {
  title: "Events",
  description: "Find something happening near you — search by title, date, and status.",
};

/**
 * Events catalogue. The shell (header, footer, filter-bar chrome) prerenders;
 * the session and `searchParams`-dependent pieces stream behind `<Suspense>`.
 */
export default function EventsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-28 sm:pt-32">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <EventsHeader
            action={
              <Suspense fallback={null}>
                <CreateEventButton />
              </Suspense>
            }
          />

          <div className="mt-10">
            <Suspense fallback={<FilterBarSkeleton />}>
              <EventsToolbar />
            </Suspense>
          </div>

          <Suspense fallback={<EventsSkeleton />}>
            <EventsResults searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
