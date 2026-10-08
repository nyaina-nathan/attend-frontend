import type { TicketStatus } from "@/app/lib/types";

const statusStyles: Record<TicketStatus, { label: string; className: string }> = {
  VALID: { label: "Valid", className: "bg-success text-paper" },
  USED: { label: "Used", className: "bg-ink text-paper" },
  CANCELLED: { label: "Cancelled", className: "bg-danger text-paper" },
  REFUNDED: { label: "Refunded", className: "bg-warning text-paper" },
};

/** Ticket lifecycle pill: valid / used / cancelled / refunded. */
export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const meta = statusStyles[status];
  return (
    <span
      className={`inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
