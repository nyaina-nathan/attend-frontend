"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apiRequest } from "@/app/lib/api";
import type { PaymentMethod } from "@/app/lib/types";
import { Pencil, Plus, Trash } from "../../ui/icons";
import ConfirmDialog from "./ConfirmDialog";
import PaymentMethodCard from "./PaymentMethodCard";
import PaymentMethodDialog from "./PaymentMethodDialog";

const actionButton =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3.5 py-1.5 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Organizer management of an event's payment methods on the edit screen. Adding
 * and editing open `PaymentMethodDialog`; deleting confirms first, then calls
 * `DELETE /payment-methods/{id}` and refreshes the server data. The API refuses
 * (`409`) methods already referenced by orders, so that failure is surfaced.
 */
export default function PaymentMethodsEditor({
  eventId,
  methods,
}: {
  eventId: string;
  methods: PaymentMethod[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [confirmMethod, setConfirmMethod] = useState<PaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(method: PaymentMethod) {
    setEditing(method);
    setError(null);
    setDialogOpen(true);
  }

  async function remove() {
    if (busy || !confirmMethod) return;
    setBusy(true);
    setError(null);

    try {
      const res = await apiRequest(`/payment-methods/${confirmMethod.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setConfirmMethod(null);
        setError(
          res.status === 409
            ? "This payment method is used by existing orders, so it can’t be deleted. Deactivate it instead."
            : "We couldn’t delete this payment method. Please try again.",
        );
        return;
      }

      setConfirmMethod(null);
      startTransition(() => router.refresh());
    } catch {
      setConfirmMethod(null);
      setError("We couldn’t delete this payment method. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Payment methods
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-4 py-2 text-xs font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <Plus className="h-3.5 w-3.5" />
          Add payment method
        </button>
      </div>

      <p className="text-sm text-ink-soft">
        How buyers can pay you for tickets. A method already used by orders can’t
        be deleted — deactivate it instead.
      </p>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}

      {methods.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-ink-soft">
          No payment methods yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {methods.map((method) => (
            <PaymentMethodCard key={method.id} method={method}>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t-2 border-ink/10 pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(method)}
                  aria-label={`Edit ${method.providerName}`}
                  className={actionButton}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setConfirmMethod(method);
                  }}
                  aria-label={`Delete ${method.providerName}`}
                  className={`${actionButton} text-danger`}
                >
                  <Trash className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </PaymentMethodCard>
          ))}
        </ul>
      )}

      {dialogOpen ? (
        <PaymentMethodDialog
          eventId={eventId}
          method={editing ?? undefined}
          onClose={() => setDialogOpen(false)}
        />
      ) : null}

      <ConfirmDialog
        open={confirmMethod !== null}
        title="Delete this payment method?"
        description={
          confirmMethod
            ? `“${confirmMethod.providerName}” will be permanently deleted. This can’t be undone.`
            : undefined
        }
        confirmLabel="Delete method"
        pendingLabel="Deleting…"
        pending={busy}
        onConfirm={remove}
        onCancel={() => {
          if (!busy) setConfirmMethod(null);
        }}
      />
    </div>
  );
}
