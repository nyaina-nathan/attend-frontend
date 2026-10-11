import DashboardEventSkeleton from "@/app/components/dashboard/events/DashboardEventSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <DashboardEventSkeleton />
    </div>
  );
}
