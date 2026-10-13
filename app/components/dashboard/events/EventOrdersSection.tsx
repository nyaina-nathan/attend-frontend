"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchEventPaymentMethods, paymentMethodLabel } from "@/app/lib/checkout";
import { approveOrder, fetchEventOrders } from "@/app/lib/event-orders";
import { formatCount } from "@/app/lib/format";
import type { Order, OrderStatus, Page } from "@/app/lib/types";
import ConfirmDialog from "./ConfirmDialog";
import EventOrdersError from "./EventOrdersError";
import EventOrdersFilterBar from "./EventOrdersFilterBar";
import EventOrdersSkeleton from "./EventOrdersSkeleton";
import OrganizerOrderRow from "./OrganizerOrderRow";
import RefuseOrderDialog from "./RefuseOrderDialog";

const pagerButton =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border-2 border-ink bg-paper px-4 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

function reviewMessage(pending: Order): string {
  return `Approve ${pending.owner.fullName}’s order? One valid ticket will be issued per unit ordered.`;
}

/**
 * Organizer view of an event's orders (`GET /events/{eventId}/orders`). Loaded
 * from the browser with 20 per page and Previous/Next navigation, so paging
 * doesn't re-stream the rest of the event page. Supports the endpoint's `status`
 * filter and lets organizers approve or refuse pending orders.
 */
export default function EventOrdersSection({
  eventId,
  priceUnit,
  canReview,
}: {
  eventId: string;
  priceUnit: string;
  canReview: boolean;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [labels, setLabels] = useState<Record<string, string>>({});
  const [approveTarget, setApproveTarget] = useState<Order | null>(null);
  const [refuseTarget, setRefuseTarget] = useState<Order | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Resolve payment method names once, best-effort (rows fall back to hiding it).
  useEffect(() => {
    let active = true;
    fetchEventPaymentMethods(eventId)
      .then((res) => {
        if (!active || !res.ok || !res.data) return;
        const map: Record<string, string> = {};
        for (const method of res.data) map[method.id] = paymentMethodLabel(method);
        setLabels(map);
      })
      .catch(() => {
        /* enrichment only — ignore */
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetchEventOrders(
          eventId,
          { page, status },
          controller.signal,
        );
        if (controller.signal.aborted) return;

        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok || !res.data) {
          setFailed(true);
          return;
        }
        setData(res.data);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [eventId, page, status, reloadKey, router]);

  const orders = data?.content ?? [];
  const total = data?.totalElements ?? orders.length;
  const totalPages = data?.totalPages ?? 0;
  const current = data?.page ?? page;

  function goToPage(next: number) {
    setLoading(true);
    setPage(next);
  }

  function changeStatus(next?: OrderStatus) {
    setStatus(next);
    setPage(0);
    setLoading(true);
  }

  function retry() {
    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  }

  function afterAction() {
    setApproveTarget(null);
    setRefuseTarget(null);
    setPendingId(null);
    setActionError(null);
    setReloadKey((key) => key + 1);
  }

  async function confirmApprove() {
    if (!approveTarget || pendingId) return;
    const orderId = approveTarget.id;
    setPendingId(orderId);
    setActionError(null);
    try {
      const res = await approveOrder(orderId);
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        setActionError(
          res.status === 409
            ? "This order can’t be approved — it’s no longer pending, or a tier is sold out."
            : res.status === 403
              ? "Only the event creator or admins can review orders."
              : res.status === 404
                ? "This order no longer exists."
                : "We couldn’t approve this order. Please try again.",
        );
        setApproveTarget(null);
        setPendingId(null);
        return;
      }
      afterAction();
    } catch {
      setActionError("We couldn’t approve this order. Please try again.");
      setApproveTarget(null);
      setPendingId(null);
    }
  }

  return (
    <section aria-labelledby="event-orders">
      <div className="flex flex-wrap items-center gap-3">
        <h2
          id="event-orders"
          className="font-display text-xl font-bold tracking-tight"
        >
          Orders
        </h2>
        {data ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            {formatCount(total)} {total === 1 ? "order" : "orders"}
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <EventOrdersFilterBar
          status={status}
          hasFilter={Boolean(status)}
          onStatusChange={changeStatus}
          onClear={() => changeStatus(undefined)}
        />
      </div>

      {actionError ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border-2 border-danger/40 bg-surface px-3 py-2 text-sm font-semibold text-danger"
        >
          {actionError}
        </p>
      ) : null}

      <div className="mt-4">
        {failed ? (
          <EventOrdersError onRetry={retry} pending={loading} />
        ) : loading && !data ? (
          <EventOrdersSkeleton />
        ) : orders.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-ink-soft">
            {status ? "No orders match this filter." : "No orders yet."}
          </p>
        ) : (
          <>
            <ul
              className={`flex flex-col gap-3 transition-opacity duration-300 ${
                loading ? "opacity-60" : "opacity-100"
              }`}
            >
              {orders.map((order) => (
                <OrganizerOrderRow
                  key={order.id}
                  order={order}
                  priceUnit={priceUnit}
                  paymentLabel={labels[order.paymentMethodId]}
                  canReview={canReview}
                  pending={pendingId === order.id}
                  onApprove={setApproveTarget}
                  onRefuse={setRefuseTarget}
                />
              ))}
            </ul>

            {totalPages > 1 ? (
              <nav
                aria-label="Orders pagination"
                className="mt-6 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => goToPage(current - 1)}
                  disabled={loading || current <= 0}
                  className={pagerButton}
                >
                  Previous
                </button>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                  Page {current + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(current + 1)}
                  disabled={loading || current >= totalPages - 1}
                  className={pagerButton}
                >
                  Next
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>

      <ConfirmDialog
        open={approveTarget !== null}
        title="Approve order"
        description={approveTarget ? reviewMessage(approveTarget) : undefined}
        confirmLabel="Approve"
        pendingLabel="Approving…"
        tone="warning"
        pending={pendingId !== null}
        onConfirm={confirmApprove}
        onCancel={() => {
          if (!pendingId) setApproveTarget(null);
        }}
      />

      {refuseTarget ? (
        <RefuseOrderDialog
          orderId={refuseTarget.id}
          buyerName={refuseTarget.owner.fullName}
          onClose={() => setRefuseTarget(null)}
          onRefused={afterAction}
        />
      ) : null}
    </section>
  );
}
