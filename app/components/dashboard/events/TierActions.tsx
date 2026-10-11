"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apiRequest } from "@/app/lib/api";
import { issuedCount } from "@/app/lib/edit-tier";
import { formatCount } from "@/app/lib/format";
import type { Tier } from "@/app/lib/types";
import { Pencil, Trash } from "../../ui/icons";
import ConfirmDialog from "./ConfirmDialog";
import EditTierDialog from "./EditTierDialog";

const actionButton =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3.5 py-1.5 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Edit and delete actions for one ticket tier. Edit opens `EditTierDialog`;
 * delete confirms first, then calls `DELETE /tiers/{tierId}` and refreshes the
 * server data (mirrors `RemoveOrganizerButton`).
 *
 * A tier with tickets already issued can't be deleted (`409` server-side), so
 * the Delete button is disabled and the reason is always visible as text.
 */
export default function TierActions({ tier }: { tier: Tier }) {
  const router = useRouter();
  const issued = issuedCount(tier);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await apiRequest(`/tiers/${tier.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setConfirmOpen(false);
        setError(
          res.status === 409
            ? "This tier has tickets, so it can’t be deleted."
            : "We couldn’t delete this tier. Please try again.",
        );
        return;
      }

      setConfirmOpen(false);
      startTransition(() => router.refresh());
    } catch {
      setConfirmOpen(false);
      setError("We couldn’t delete this tier. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2 border-t-2 border-ink/10 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditOpen(true);
          }}
          aria-label={`Edit ${tier.tierName}`}
          className={actionButton}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirmOpen(true);
          }}
          disabled={issued > 0}
          aria-label={`Delete ${tier.tierName}`}
          className={`${actionButton} text-danger`}
        >
          <Trash className="h-3.5 w-3.5" />
          Delete
        </button>

        {issued > 0 ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            {formatCount(issued)} ticket{issued === 1 ? "" : "s"} issued — can’t
            delete
          </span>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-danger bg-danger/10 px-3 py-2 text-xs font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}

      {editOpen ? (
        <EditTierDialog tier={tier} onClose={() => setEditOpen(false)} />
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this tier?"
        description={`“${tier.tierName}” will be permanently deleted. This can’t be undone.`}
        confirmLabel="Delete tier"
        pendingLabel="Deleting…"
        pending={busy}
        onConfirm={remove}
        onCancel={() => {
          if (!busy) setConfirmOpen(false);
        }}
      />
    </div>
  );
}
