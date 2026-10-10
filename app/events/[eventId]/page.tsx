import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Footer from "@/app/components/site/Footer";
import Navbar from "@/app/components/site/Navbar";
import AccessState from "@/app/components/event/AccessState";
import EventHeader from "@/app/components/event/EventHeader";
import EventInfo from "@/app/components/event/EventInfo";
import EventSkeleton from "@/app/components/event/EventSkeleton";
import MobileTicketBar from "@/app/components/event/MobileTicketBar";
import OrganizerBar from "@/app/components/event/OrganizerBar";
import StatusBanner from "@/app/components/event/StatusBanner";
import TicketPanel from "@/app/components/event/TicketPanel";
import { getEventMetadata, getEventResult, isAuthenticated } from "@/app/lib/event";

interface PageParams {
  params: Promise<{ eventId: string }>;
}

function trimmedDescription(description: string | null): string | undefined {
  if (!description) return undefined;
  const trimmed = description.trim().replace(/\s+/g, " ");
  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}…` : trimmed;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { eventId } = await params;
  // Public-only fetch: private events return minimal metadata, never a title.
  const event = await getEventMetadata(eventId);
  if (!event) return { title: "Event" };

  const description = trimmedDescription(event.description);
  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "website",
    },
  };
}

/**
 * Static shell: chrome renders immediately, the event itself streams in behind
 * `<Suspense>` because it reads cookies and uses a no-store fetch.
 */
export default function EventPage({ params }: PageParams) {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-28 pb-28 sm:pt-32 lg:pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<EventSkeleton />}>
            <EventContent params={params} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function EventContent({ params }: PageParams) {
  const { eventId } = await params;
  const result = await getEventResult(eventId);
  console.log(result)

  if (result.status === 404) notFound();
  if (result.status === 401) {
    return <AccessState kind="login" />;
  }
  if (result.status === 403) {
    return <AccessState kind="forbidden" />;
  }
  if (!result.ok) {
    throw new Error(`Failed to load event ${eventId} (status ${result.status})`);
  }

  const event = result.data;
  const tiers = event.tiers ?? [];
  const authenticated = await isAuthenticated();

  return (
    <>
      <StatusBanner
        status={event.status}
        startTime={event.startTime}
        endTime={event.endTime}
      />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          {event.myRole ? (
            <OrganizerBar
              eventId={event.id}
              myRole={event.myRole}
              status={event.status}
            />
          ) : null}
          <EventHeader event={event} />
          <EventInfo event={event} />
        </div>

        <div className="lg:col-span-1">
          <TicketPanel
            eventId={event.id}
            eventStatus={event.status}
            initialTiers={tiers}
            isAuthenticated={authenticated}
          />
        </div>
      </div>

      <MobileTicketBar eventStatus={event.status} tiers={tiers} />
    </>
  );
}
