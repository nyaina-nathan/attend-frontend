import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import EventEditForm from "@/app/components/dashboard/events/EventEditForm";
import EventEditSkeleton from "@/app/components/dashboard/events/EventEditSkeleton";
import { getEventResult } from "@/app/lib/event";

export const metadata: Metadata = {
  title: "Edit event",
  description: "Update the details of an event you host.",
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
 * Organizer-only edit screen. The event streams in behind `<Suspense>` because
 * it reads cookies and uses a no-store fetch; the form itself boots on the
 * client so its `datetime-local` values use the visitor's timezone.
 */
export default function DashboardEventEditPage({ params }: PageParams) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <Suspense fallback={<EventEditSkeleton />}>
        <EditContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditContent({ params }: PageParams) {
  const { eventId } = await params;
  const result = await getEventResult(eventId);

  if (result.status === 401) redirect("/login");
  if (result.status === 403 || result.status === 404) notFound();
  if (!result.ok) {
    throw new Error(`Failed to load event ${eventId} (status ${result.status})`);
  }
  if (result.data.myRole === null) notFound();

  return <EventEditForm event={result.data} />;
}
