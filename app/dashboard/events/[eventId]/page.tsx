import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import AttendeesSection from "@/app/components/dashboard/events/AttendeesSection";
import CollaboratorsSection from "@/app/components/dashboard/events/CollaboratorsSection";
import CollaboratorsSkeleton from "@/app/components/dashboard/events/CollaboratorsSkeleton";
import DashboardEventDetail from "@/app/components/dashboard/events/DashboardEventDetail";
import DashboardEventSkeleton from "@/app/components/dashboard/events/DashboardEventSkeleton";
import PaymentMethodsSection, {
  PaymentMethodsSkeleton,
} from "@/app/components/dashboard/events/PaymentMethodsSection";
import { getEventResult } from "@/app/lib/event";

export const metadata: Metadata = {
  title: "Event",
  description:
    "The full details of one of the events you host — schedule, venue, tiers and visibility.",
};

/**
 * `usePathname()` in the shared `DashboardSidebar` can't be part of this route's
 * static shell because the dynamic `[eventId]` segment isn't known at build
 * time. Opt out of static-shell prerendering so the route is allowed to block.
 * @see https://nextjs.org/docs/messages/blocking-prerender-client-hook
 */
export const instant = false;

interface PageParams {
  params: Promise<{ eventId: string }>;
}

/**
 * Organizer view of a single event. The event streams in behind `<Suspense>`
 * because it reads cookies and uses a no-store fetch.
 */
export default function DashboardEventPage({ params }: PageParams) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <Suspense fallback={<DashboardEventSkeleton />}>
        <EventContent params={params} />
      </Suspense>
    </div>
  );
}

/**
 * Resolves one event for the caller. Organizer-only: a `403`/`404`, or an event
 * the caller does not organize (`myRole === null`), is hidden via `notFound()`.
 * A `401` means the session is gone, so redirect to login.
 */
async function EventContent({ params }: PageParams) {
  const { eventId } = await params;
  const result = await getEventResult(eventId);

  if (result.status === 401) redirect("/login");
  if (result.status === 403 || result.status === 404) notFound();
  if (!result.ok) {
    throw new Error(`Failed to load event ${eventId} (status ${result.status})`);
  }
  if (result.data.myRole === null) notFound();

  return (
    <>
      <DashboardEventDetail event={result.data} />

      <div className="mt-12">
        <Suspense fallback={<PaymentMethodsSkeleton />}>
          <PaymentMethodsSection eventId={eventId} />
        </Suspense>
      </div>

      <div className="mt-12">
        <Suspense fallback={<CollaboratorsSkeleton />}>
          <CollaboratorsSection
            eventId={eventId}
            myRole={result.data.myRole}
          />
        </Suspense>
      </div>

      <div className="mt-12">
        <AttendeesSection
          eventId={eventId}
          tiers={result.data.tiers}
          priceUnit={result.data.priceUnit}
        />
      </div>
    </>
  );
}
