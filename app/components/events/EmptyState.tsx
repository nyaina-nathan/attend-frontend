import Link from "next/link";
import { Calendar } from "../ui/icons";

export default function EmptyState({
  hasFilters,
  isAuthenticated,
}: {
  hasFilters: boolean;
  isAuthenticated: boolean;
}) {
  if (hasFilters) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand">
          <Calendar className="h-7 w-7" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-display text-xl font-bold">No events match your search</p>
          <p className="text-sm text-ink-soft">
            Try removing a filter or widening the date range.
          </p>
        </div>
        <Link
          href="/events"
          className="mt-2 rounded-full border-2 border-ink bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Reset filters
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand">
        <Calendar className="h-7 w-7" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-bold">No events yet</p>
        <p className="text-sm text-ink-soft">
          Be the first to put something on the calendar.
        </p>
      </div>
      <Link
        href={isAuthenticated ? "/events/new" : "/register"}
        className="mt-2 rounded-full border-2 border-ink bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Create an event
      </Link>
    </div>
  );
}
