import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import EventOrdersSection from "@/app/components/dashboard/events/EventOrdersSection";
import EventOrdersSkeleton from "@/app/components/dashboard/events/EventOrdersSkeleton";
import { ArrowRight } from "@/app/components/ui/icons";
import { getEventResult } from "@/app/lib/event";

export const metadata: Metadata = {
  title: "Event orders",
  description:
    "Review every ticket order on your event and approve or refuse the pending ones.",
};

/**
 * `usePathname()` in the shared `DashboardSidebar` can't be part of this route's
 * static shell because the dynamic `[eventId]` segment isn't known at build
 * time. Opt out of static-shell prerendering so the route is allowed to block.
 */
export const instant = false;

interface PageParams {
  params: Promise<{ eventId: string }>;
}

/**
 * Organizer view of one event's orders. The event streams in behind
 * `<Suspense>` because it reads cookies and uses a no-store fetch; the orders
 * list itself loads from the browser inside `EventOrdersSection`.
 */
export default function EventOrdersPage({ params }: PageParams) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <Suspense fallback={<EventOrdersSkeleton count={4} />}>
        <OrdersContent params={params} />
      </Suspense>
    </div>
  );
}

/**
 * Resolves one event for the caller. Organizer-only: a `403`/`404`, or an event
 * the caller does not organize (`myRole === null`), is hidden via `notFound()`.
 * A `401` means the session is gone, so redirect to login.
 */
async function OrdersContent({ params }: PageParams) {
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
      <Link
        href={`/dashboard/events/${eventId}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink-soft transition-colors duration-300 ease-brutal hover:text-accent"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        Back to event
      </Link>

      <header className="mt-6 flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          {result.data.title}
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl">
          Orders
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft">
          Every ticket order on this event, newest first. Approve or refuse the
          ones still pending.
        </p>
      </header>

      <div className="mt-8">
        <EventOrdersSection
          eventId={eventId}
          priceUnit={result.data.priceUnit}
          canReview={result.data.myRole !== null}
        />
      </div>
    </>
  );
}
