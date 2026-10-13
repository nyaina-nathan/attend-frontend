import type { OrderStatus } from "@/app/lib/types";

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-warning text-paper" },
  APPROVED: { label: "Approved", className: "bg-success text-paper" },
  REFUSED: { label: "Refused", className: "bg-danger text-paper" },
  CANCELLED: { label: "Cancelled", className: "bg-ink text-paper" },
};

/** Order lifecycle pill: pending / approved / refused / cancelled. */
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = statusStyles[status];
  return (
    <span
      className={`inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
