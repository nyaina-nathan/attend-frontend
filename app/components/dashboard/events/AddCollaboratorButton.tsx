"use client";

import { useState } from "react";
import { Plus } from "../../ui/icons";
import AddCollaboratorDialog from "./AddCollaboratorDialog";

/**
 * "Add collaborator" trigger for the event detail page. Opens the search popup;
 * rendered only for the event `CREATOR`, since inviting is creator-only.
 */
export default function AddCollaboratorButton({
  eventId,
  excludeUserIds,
}: {
  eventId: string;
  excludeUserIds: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-4 py-2 text-xs font-semibold text-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        <Plus className="h-3.5 w-3.5" />
        Add collaborator
      </button>

      {open ? (
        <AddCollaboratorDialog
          eventId={eventId}
          excludeUserIds={excludeUserIds}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
