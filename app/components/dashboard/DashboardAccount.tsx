import Link from "next/link";
import { getCurrentUser } from "@/app/lib/auth";
import { initials } from "@/app/lib/format";
import LogoutButton from "./LogoutButton";

/** Account block pinned to the bottom of the dashboard sidebar. Streams in. */
export default async function DashboardAccount() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex w-full items-center justify-center rounded-full border-2 border-ink bg-brand px-4 py-2 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-accent text-xs font-bold text-paper"
        >
          {initials(user.fullName)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">
            {user.fullName}
          </span>
          <span className="truncate font-mono text-[10px] text-ink-soft">
            @{user.username}
          </span>
        </span>
      </div>
      <LogoutButton />
    </div>
  );
}

/** Matches the account block's footprint while the session resolves. */
export function DashboardAccountSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-ink/10" />
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="h-3.5 w-24 animate-pulse rounded bg-ink/10" />
          <span className="h-2.5 w-16 animate-pulse rounded bg-ink/10" />
        </span>
      </div>
      <span className="h-9 w-full animate-pulse rounded-full bg-ink/10" />
    </div>
  );
}
