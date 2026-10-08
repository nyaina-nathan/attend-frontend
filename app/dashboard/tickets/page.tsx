import type { Metadata } from "next";
import { Suspense } from "react";
import TicketsFilterBar from "@/app/components/tickets/TicketsFilterBar";
import TicketsHeader from "@/app/components/tickets/TicketsHeader";
import TicketsResults from "@/app/components/tickets/TicketsResults";
import TicketsSkeleton, {
  TicketsFilterBarSkeleton,
} from "@/app/components/tickets/TicketsSkeleton";
import type { RawSearchParams } from "@/app/lib/tickets-query";

export const metadata: Metadata = {
  title: "My tickets",
  description:
    "Every ticket you hold — upcoming by default, with your QR codes ready at the door.",
};

/**
 * The caller's tickets. The shell prerenders; the filter bar and the
 * `searchParams`/session-dependent list stream behind `<Suspense>`.
 */
export default function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <TicketsHeader />

      <div className="mt-10">
        <Suspense fallback={<TicketsFilterBarSkeleton />}>
          <TicketsFilterBar />
        </Suspense>
      </div>

      <Suspense fallback={<TicketsSkeleton />}>
        <TicketsResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
