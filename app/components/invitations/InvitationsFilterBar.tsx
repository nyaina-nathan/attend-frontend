"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  DIRECTION_OPTIONS,
  INVITATION_STATUS_OPTIONS,
  parseInvitationsSearchParams,
} from "@/app/lib/invitations-query";
import type { InvitationDirection, InvitationStatus } from "@/app/lib/types";

const pill =
  "rounded-full border-2 border-ink px-3.5 py-1.5 text-xs font-semibold shadow-brutal-sm transition-all duration-300 ease-brutal hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none";

const label = "font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft";

/**
 * Received/Sent switch and optional status filter, written to the URL so the
 * section stays shareable and server-rendered. Any change resets to the first
 * page.
 */
export default function InvitationsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { query } = parseInvitationsSearchParams(
    Object.fromEntries(searchParams.entries()),
  );

  const replace = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      mutate(params);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setDirection = (direction: InvitationDirection) =>
    replace((params) => {
      // "received" is the default, so it stays out of the URL.
      if (direction === "received") params.delete("direction");
      else params.set("direction", direction);
    });

  const setStatus = (status?: InvitationStatus) =>
    replace((params) => {
      if (status) params.set("status", status);
      else params.delete("status");
    });

  return (
    <div className="rounded-2xl border-2 border-ink bg-surface/90 p-3 shadow-brutal backdrop-blur-md sm:p-4 md:sticky md:top-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex flex-col gap-2">
          <span className={label}>Show</span>
          <div
            role="group"
            aria-label="Invitation section"
            className="flex flex-wrap gap-2"
          >
            {DIRECTION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={query.direction === option.value}
                onClick={() => setDirection(option.value)}
                className={`${pill} ${
                  query.direction === option.value ? "bg-accent text-paper" : "bg-paper"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={label}>Status</span>
          <div
            role="group"
            aria-label="Invitation status"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={!query.status}
              onClick={() => setStatus(undefined)}
              className={`${pill} ${!query.status ? "bg-accent text-paper" : "bg-paper"}`}
            >
              All
            </button>
            {INVITATION_STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={query.status === option.value}
                onClick={() => setStatus(option.value)}
                className={`${pill} ${
                  query.status === option.value ? "bg-accent text-paper" : "bg-paper"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
