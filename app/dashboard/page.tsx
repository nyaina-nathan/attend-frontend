import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AttentionList from "@/app/components/dashboard/AttentionList";
import CombinedEmpty from "@/app/components/dashboard/CombinedEmpty";
import DashboardError from "@/app/components/dashboard/DashboardError";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import DashboardSkeleton from "@/app/components/dashboard/DashboardSkeleton";
import NextEventCard from "@/app/components/dashboard/NextEventCard";
import NextTicketCard from "@/app/components/dashboard/NextTicketCard";
import StatTiles from "@/app/components/dashboard/StatTiles";
import WelcomeState from "@/app/components/dashboard/WelcomeState";
import { getCurrentUser } from "@/app/lib/auth";
import { getDashboard } from "@/app/lib/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your next events and tickets, organizer stats, and everything that needs your attention.",
};

/**
 * Dashboard home. The shell streams in behind `<Suspense>` because the
 * aggregate call is per-user and never cached.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const result = await getDashboard();

  if (!result.ok) {
    if (result.status === 401) {
      redirect("/login");
    }
    return <DashboardError />;
  }

  const { organizing, attending } = result.data;
  const user = await getCurrentUser();
  const fullName = user?.fullName ?? "there";

  const hasAnything =
    organizing.eventsTotal > 0 ||
    attending.ticketsUpcoming > 0 ||
    organizing.nextEvent !== null ||
    attending.nextTicket !== null ||
    organizing.attention.length > 0;

  const bothNextEmpty =
    organizing.nextEvent === null && attending.nextTicket === null;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader fullName={fullName} />

      {!hasAnything ? (
        <WelcomeState fullName={fullName} />
      ) : (
        <>
          <section aria-label="Next up" className="grid gap-5 lg:grid-cols-2">
            {bothNextEmpty ? (
              <CombinedEmpty />
            ) : (
              <>
                <NextEventCard event={organizing.nextEvent} />
                <NextTicketCard ticket={attending.nextTicket} />
              </>
            )}
          </section>

          <StatTiles organizing={organizing} attending={attending} />

          {/*
            The month calendar (about 2/3 wide) belongs here once the backend
            exposes `myRole` and `status=ALL` on GET /events. Until then the
            attention column spans the full row.
          */}
          <AttentionList items={organizing.attention} />
        </>
      )}
    </div>
  );
}
