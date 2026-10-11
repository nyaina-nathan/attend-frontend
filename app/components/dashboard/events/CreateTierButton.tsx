"use client";

import { useState } from "react";
import { Plus } from "../../ui/icons";
import CreateTierDialog from "./CreateTierDialog";

/**
 * "Create new tier" trigger for the event detail page. Opens the tier form;
 * the API allows any organizer (`CREATOR` or `ADMIN`) to create tiers, and this
 * page is organizer-only, so no extra gating is needed here.
 */
export default function CreateTierButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-4 py-2 text-xs font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        <Plus className="h-3.5 w-3.5" />
        Create new tier
      </button>

      {open ? (
        <CreateTierDialog eventId={eventId} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
