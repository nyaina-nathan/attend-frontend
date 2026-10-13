"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { formatRelativeToNow } from "@/app/lib/format";
import type { AttentionItem } from "@/app/lib/types";
import { ArrowRight, Check, Layers, Receipt, Ticket, Users } from "../ui/icons";
import { useNow } from "./useNow";

interface Resolved {
  message: string;
  href: string;
  icon: ReactNode;
  tone: "warning" | "info" | "danger";
}

function resolve(item: AttentionItem, now: number | null): Resolved | null {
  switch (item.type) {
    case "NO_TIERS": {
      const when = now === null ? "soon" : formatRelativeToNow(item.startTime, now);
      return {
        message: `${item.eventTitle} starts ${when} and has no tickets yet`,
        href: `/dashboard/events/${item.eventId}/tiers`,
        icon: <Layers className="h-4 w-4" />,
        tone: "warning",
      };
    }
    case "LOW_STOCK":
      return {
        message: `${item.tierName ?? "A tier"} is almost sold out (${
          item.remaining ?? 0
        } left)`,
        href: `/dashboard/events/${item.eventId}/tiers`,
        icon: <Ticket className="h-4 w-4" />,
        tone: "info",
      };
    case "POSTPONED":
      return {
        message: `${item.eventTitle} was postponed: review its tickets`,
        href: `/dashboard/events/${item.eventId}/attendees`,
        icon: <Users className="h-4 w-4" />,
        tone: "danger",
      };
    case "PENDING_ORDERS": {
      const count = item.pendingOrders ?? 0;
      return {
        message: `${count} order${
          count === 1 ? "" : "s"
        } awaiting review on ${item.eventTitle}`,
        href: `/dashboard/events/${item.eventId}/orders`,
        icon: <Receipt className="h-4 w-4" />,
        tone: "warning",
      };
    }
    default:
      // Unknown rule: ignore so new backend rules can ship independently.
      return null;
  }
}

const toneStyles: Record<Resolved["tone"], string> = {
  warning: "bg-warning/10",
  info: "bg-accent-soft",
  danger: "bg-danger/10",
};

/**
 * Up to five organizer to-dos, soonest first. Client-side only so the relative
 * time is computed from the visitor's clock; unknown `type` values are ignored.
 */
export default function AttentionList({ items }: { items: AttentionItem[] }) {
  const now = useNow();

  const resolved = [...items]
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((item) => ({ item, view: resolve(item, now) }))
    .filter((entry): entry is { item: AttentionItem; view: Resolved } =>
      entry.view !== null,
    )
    .slice(0, 5);

  return (
    <section
      aria-labelledby="attention-title"
      className="rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal sm:p-6"
    >
      <h2 id="attention-title" className="font-display text-xl font-bold">
        Needs attention
      </h2>

      {resolved.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-ink/30 px-4 py-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-success text-paper">
            <Check className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-ink-soft">
            All good, nothing needs your attention.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {resolved.map(({ item, view }) => (
            <li key={`${item.type}-${item.eventId}-${item.tierId ?? ""}`}>
              <Link
                href={view.href}
                className={`group flex items-center gap-3 rounded-2xl border-2 border-ink px-4 py-3 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${toneStyles[view.tone]}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper">
                  {view.icon}
                </span>
                <span className="min-w-0 flex-1">{view.message}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-500 ease-brutal group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
