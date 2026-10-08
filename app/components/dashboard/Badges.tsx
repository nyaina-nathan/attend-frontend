import type { EventRole, EventStatus } from "@/app/lib/types";

const statusStyles: Record<
  Exclude<EventStatus, "OK">,
  { label: string; className: string }
> = {
  CANCELLED: { label: "Cancelled", className: "bg-danger text-paper" },
  POSTPONED: { label: "Postponed", className: "bg-warning text-paper" },
};

/** Non-OK status pill; renders nothing for a healthy event. */
export function StatusBadge({ status }: { status: EventStatus }) {
  if (status === "OK") return null;
  const meta = statusStyles[status];
  return (
    <span
      className={`inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

/** The caller's role on an event. */
export function RoleBadge({ role }: { role: EventRole }) {
  return (
    <span className="inline-flex rounded-full border-2 border-ink bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
      {role === "CREATOR" ? "Creator" : "Admin"}
    </span>
  );
}
