import {
  isoToLocalDateTimeInput,
  localDateTimeInputToISO,
} from "./events-query";
import type { EventDraft } from "./create-event";
import type { EventDetail, EventUpdateInput } from "./types";

/**
 * Client-side mapping for the edit-event form. The draft mirrors
 * `EventCreateInput` but keeps `datetime-local` strings, converted to and from
 * the ISO UTC values the API uses.
 */

/** Seed an editable draft from the fetched event, in the visitor's timezone. */
export function eventDraftFromDetail(event: EventDetail): EventDraft {
  return {
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    isPublic: event.isPublic,
    priceUnit: event.priceUnit ?? "USD",
    startTime: isoToLocalDateTimeInput(event.startTime),
    endTime: isoToLocalDateTimeInput(event.endTime),
  };
}

function trimmed(value: string): string {
  return value.trim();
}

/**
 * Build a partial `EventUpdateRequest` with only the fields that actually
 * changed. Empty description/location are sent as `""` so they can be cleared.
 */
export function buildEventUpdateInput(
  initial: EventDraft,
  draft: EventDraft,
): EventUpdateInput {
  const input: EventUpdateInput = {};

  if (trimmed(draft.title) !== trimmed(initial.title)) {
    input.title = trimmed(draft.title);
  }
  if (trimmed(draft.description) !== trimmed(initial.description)) {
    input.description = trimmed(draft.description);
  }
  if (trimmed(draft.location) !== trimmed(initial.location)) {
    input.location = trimmed(draft.location);
  }
  if (draft.isPublic !== initial.isPublic) {
    input.isPublic = draft.isPublic;
  }

  const priceUnit = trimmed(draft.priceUnit) || "USD";
  if (priceUnit !== (trimmed(initial.priceUnit) || "USD")) {
    input.priceUnit = priceUnit;
  }

  const startTime = localDateTimeInputToISO(draft.startTime);
  if (startTime && startTime !== localDateTimeInputToISO(initial.startTime)) {
    input.startTime = startTime;
  }
  const endTime = localDateTimeInputToISO(draft.endTime);
  if (endTime && endTime !== localDateTimeInputToISO(initial.endTime)) {
    input.endTime = endTime;
  }

  return input;
}
