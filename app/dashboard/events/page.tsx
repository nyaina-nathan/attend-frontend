import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardEventsFilterBar from "@/app/components/dashboard/events/DashboardEventsFilterBar";
import DashboardEventsHeader from "@/app/components/dashboard/events/DashboardEventsHeader";
import DashboardEventsResults from "@/app/components/dashboard/events/DashboardEventsResults";
import DashboardEventsSkeleton, {
  DashboardEventsFilterBarSkeleton,
} from "@/app/components/dashboard/events/DashboardEventsSkeleton";
import type { RawSearchParams } from "@/app/lib/events-query";

export const metadata: Metadata = {
  title: "My events",
  description:
    "Every event you host — public or private — with the tools to manage it.",
};

/**
 * The events the caller is hosting. `isMine` is forced on in the data layer and
 * cannot be turned off. The shell prerenders; the filter bar and the
 * `searchParams`-dependent list stream behind `<Suspense>`.
 */
export default function DashboardEventsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <DashboardEventsHeader />

      <div className="mt-10">
        <Suspense fallback={<DashboardEventsFilterBarSkeleton />}>
          <DashboardEventsFilterBar />
        </Suspense>
      </div>

      <Suspense fallback={<DashboardEventsSkeleton />}>
        <DashboardEventsResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
