"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/format";
import type {
  EventStatus,
  Tier,
  Ticket,
  TierTicketPresence,
} from "@/app/lib/types";
import TicketCard from "../landing/TicketCard";
import ConfirmDialog from "../dashboard/events/ConfirmDialog";
import { Ticket as TicketIcon } from "../ui/icons";
import TierCard from "./TierCard";

interface Message {
  tone: "info" | "error";
  text: string;
  retryTierId?: string;
}

/** Tiers already holding one of the caller's tickets, pending confirmation. */
interface DuplicatePrompt {
  tier: Tier;
  presentTierNames: string[];
}

/** Outcome of the pre-purchase duplicate check. */
type PresenceResult =
  | { kind: "present"; names: string[] }
  | { kind: "none" }
  | { kind: "unauthorized" }
  | { kind: "unknown" };

function formatTicketDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Purchase surface: tier list, buy flow, and the post-purchase ticket.
 * Lives on the client so it can hit the ticket endpoint with cookies and keep
 * `remaining` fresh after every attempt.
 */
export default function TicketPanel({
  eventId,
  eventStatus,
  initialTiers,
  isAuthenticated,
  priceUnit,
}: {
  eventId: string;
  eventStatus: EventStatus;
  initialTiers: Tier[];
  isAuthenticated: boolean;
  priceUnit: string;
}) {
  const router = useRouter();
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);
  const [purchasedTicket, setPurchasedTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicatePrompt | null>(null);

  const cancelled = eventStatus === "CANCELLED";
  const busy = loadingTierId !== null;
  const loginHref = "/login";

  async function refreshTiers() {
    try {
      const res = await apiRequest<Tier[]>(`/events/${eventId}/tiers`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok && res.data) setTiers(res.data);
    } catch {
      // Keep the last known tiers; the error is surfaced by the buy flow.
    }
  }

  function issueTicket(tierId: string) {
    return apiRequest<Ticket>(`/tiers/${tierId}/tickets`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  }

  function refreshSession() {
    return apiRequest("/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  }

  function checkTier(tierId: string) {
    return apiRequest<TierTicketPresence>(`/tiers/${tierId}/check`, {
      credentials: "include",
      cache: "no-store",
    });
  }

  /**
   * Ask the API which tiers already hold one of the caller's tickets. The check
   * endpoint is per-tier, so we fan out across the event's tiers to warn about a
   * duplicate anywhere in the event. A 401 rotates the session once; any other
   * failure fails open (treated as "no duplicate") so the guard never blocks a
   * legitimate purchase.
   */
  async function checkEventPresence(): Promise<PresenceResult> {
    try {
      let results = await Promise.all(tiers.map((tier) => checkTier(tier.id)));

      if (results.some((res) => res.status === 401)) {
        const refreshed = await refreshSession();
        if (!refreshed.ok) return { kind: "unauthorized" };
        results = await Promise.all(tiers.map((tier) => checkTier(tier.id)));
        if (results.some((res) => res.status === 401)) {
          return { kind: "unauthorized" };
        }
      }

      const names = tiers
        .filter((_, index) => results[index].ok && results[index].data?.isPresent)
        .map((tier) => tier.tierName);

      return names.length > 0 ? { kind: "present", names } : { kind: "none" };
    } catch {
      return { kind: "unknown" };
    }
  }

  async function purchase(tier: Tier) {
    try {
      let res = await issueTicket(tier.id);

      // Access token may have expired: rotate once, then retry.
      if (res.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed.ok) {
          res = await issueTicket(tier.id);
        }
        if (res.status === 401) {
          router.push(loginHref);
          return;
        }
      }

      if (res.ok && res.data) {
        setPurchasedTicket(res.data);
      } else if (res.errorCode === "SOLD_OUT") {
        setMessage({ tone: "info", text: "Sorry, this tier just sold out." });
      } else if (res.errorCode === "EVENT_NOT_OPEN") {
        setMessage({ tone: "error", text: "This event is no longer open." });
      } else {
        setMessage({
          tone: "error",
          text: "Something went wrong. Please try again.",
          retryTierId: tier.id,
        });
      }
    } catch {
      setMessage({
        tone: "error",
        text: "Something went wrong. Please try again.",
        retryTierId: tier.id,
      });
    } finally {
      await refreshTiers();
    }
  }

  async function handleGet(tier: Tier) {
    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }

    setMessage(null);
    setLoadingTierId(tier.id);

    try {
      const presence = await checkEventPresence();

      if (presence.kind === "unauthorized") {
        router.push(loginHref);
        return;
      }

      if (presence.kind === "present") {
        setDuplicate({ tier, presentTierNames: presence.names });
        return;
      }

      await purchase(tier);
    } finally {
      setLoadingTierId(null);
    }
  }

  async function confirmDuplicate() {
    const prompt = duplicate;
    if (!prompt) return;

    setDuplicate(null);
    setLoadingTierId(prompt.tier.id);
    try {
      await purchase(prompt.tier);
    } finally {
      setLoadingTierId(null);
    }
  }

  const duplicateDescription = duplicate
    ? `You already have a ticket for this event (${duplicate.presentTierNames.join(
        ", ",
      )}). Buy another one anyway?`
    : undefined;

  return (
    <aside
      id="tickets"
      aria-label="Tickets"
      className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start"
    >
      <div className="rounded-3xl border-2 border-ink bg-surface p-5 shadow-brutal sm:p-6">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Tickets
        </h2>

        {purchasedTicket ? (
          <div aria-live="polite" className="mt-4 flex flex-col gap-4">
            <p className="text-sm font-semibold text-success">
              You’re in! Here’s your ticket.
            </p>
            <TicketCard
              title={purchasedTicket.event.title}
              date={formatTicketDate(purchasedTicket.event.startTime)}
              venue={purchasedTicket.event.location ?? "Online"}
              tier={purchasedTicket.tier.tierName}
              price={formatPrice(
                purchasedTicket.pricePaid,
                purchasedTicket.event.priceUnit,
              )}
              code={`ATT-${purchasedTicket.id.slice(0, 8).toUpperCase()}`}
            />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tickets"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-5 py-2.5 text-sm font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                <TicketIcon className="h-4 w-4" />
                My tickets
              </Link>
              <button
                type="button"
                onClick={() => setPurchasedTicket(null)}
                className="inline-flex items-center rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Get another ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {cancelled ? (
              <p className="rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
                Ticket sales are closed — this event was cancelled.
              </p>
            ) : null}

            {tiers.length === 0 ? (
              <p className="rounded-xl border-2 border-dashed border-ink/30 px-4 py-8 text-center text-sm text-ink-soft">
                No tickets available yet.
              </p>
            ) : (
              tiers.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  priceUnit={priceUnit}
                  disabled={cancelled || busy}
                  loading={loadingTierId === tier.id}
                  disabledReason={
                    cancelled
                      ? "Ticket sales are closed"
                      : busy && loadingTierId !== tier.id
                        ? "Another purchase is in progress"
                        : undefined
                  }
                  onGet={handleGet}
                />
              ))
            )}

            <div aria-live="polite" className="min-h-0">
              {message ? (
                <div
                  className={`mt-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                    message.tone === "error"
                      ? "border-danger bg-danger/10 text-danger"
                      : "border-warning bg-warning/10 text-warning"
                  }`}
                >
                  <span>{message.text}</span>
                  {message.retryTierId ? (
                    <button
                      type="button"
                      onClick={() => {
                        const tier = tiers.find(
                          (item) => item.id === message.retryTierId,
                        );
                        if (tier) handleGet(tier);
                      }}
                      disabled={busy}
                      className="rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {!isAuthenticated && tiers.length > 0 && !cancelled ? (
              <p className="text-xs text-ink-soft">
                You’ll be asked to log in before getting a ticket.
              </p>
            ) : null}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={duplicate !== null}
        tone="warning"
        title="You already have a ticket"
        description={duplicateDescription}
        confirmLabel="Buy another ticket"
        cancelLabel="Cancel"
        onConfirm={confirmDuplicate}
        onCancel={() => setDuplicate(null)}
      />
    </aside>
  );
}
