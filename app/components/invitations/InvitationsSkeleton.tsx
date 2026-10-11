export function InvitationsFilterBarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[128px] animate-pulse rounded-2xl border-2 border-ink/20 bg-paper md:h-[92px]"
    />
  );
}

/** Loading placeholder mirroring the invitation rows. */
export default function InvitationsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="mt-8 flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl border-2 border-ink/20 bg-paper p-4 sm:gap-5 sm:p-5"
        >
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-ink/10 sm:h-16 sm:w-16" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-3.5 w-16 animate-pulse rounded-full bg-ink/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-ink/10" />
          </div>
          <div className="hidden h-9 w-24 animate-pulse rounded-full bg-ink/10 sm:block" />
        </div>
      ))}
    </div>
  );
}
