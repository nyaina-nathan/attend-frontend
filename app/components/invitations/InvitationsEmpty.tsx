import Link from "next/link";
import type { InvitationDirection } from "@/app/lib/types";
import { Mail } from "../ui/icons";

const filledCta =
  "inline-flex items-center justify-center rounded-full border-2 border-ink bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";

const outlineCta =
  "inline-flex items-center justify-center rounded-full border-2 border-ink bg-paper px-6 py-3 text-sm font-semibold shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";

/**
 * Empty list: either no invitations match the status filter, or the section is
 * simply empty.
 */
export default function InvitationsEmpty({
  direction,
  hasFilters,
}: {
  direction: InvitationDirection;
  hasFilters: boolean;
}) {
  if (hasFilters) {
    const resetHref =
      direction === "sent"
        ? "/dashboard/invitations?direction=sent"
        : "/dashboard/invitations";

    return (
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-5 py-12 text-center sm:px-6 sm:py-16">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand">
          <Mail className="h-7 w-7" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-display text-xl font-bold">No invitations match</p>
          <p className="text-sm text-ink-soft">
            Try another status, or reset the filter.
          </p>
        </div>
        <Link href={resetHref} scroll={false} className={`mt-2 ${filledCta}`}>
          Reset filter
        </Link>
      </div>
    );
  }

  const received = direction === "received";

  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-brand">
        <Mail className="h-7 w-7" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-bold">
          {received ? "No invitations yet" : "You haven’t sent any invitations"}
        </p>
        <p className="text-sm text-ink-soft">
          {received
            ? "When someone invites you to help organize their event, it’ll show up here."
            : "Invite a collaborator from one of your events and it’ll show up here."}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard/events" className={filledCta}>
          My events
        </Link>
        <Link href="/events" className={outlineCta}>
          Browse events
        </Link>
      </div>
    </div>
  );
}
