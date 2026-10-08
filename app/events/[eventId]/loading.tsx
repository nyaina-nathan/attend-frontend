import EventSkeleton from "@/app/components/event/EventSkeleton";

export default function Loading() {
  return (
    <main id="main" className="flex-1 pt-28 pb-28 sm:pt-32 lg:pb-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <EventSkeleton />
      </div>
    </main>
  );
}
