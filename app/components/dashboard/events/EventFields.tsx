"use client";

import Field from "../../auth/Field";
import type { EventDraft, EventErrors } from "@/app/lib/create-event";

const textareaClass =
  "w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/60 focus:border-accent";

/** Step 1 of the create-event wizard: the `EventCreateRequest` fields. */
export default function EventFields({
  draft,
  errors,
  onChange,
}: {
  draft: EventDraft;
  errors: EventErrors;
  onChange: (patch: Partial<EventDraft>) => void;
}) {
  return (
    <div className="mt-5 flex flex-col gap-4">
      <Field
        label="Title"
        name="title"
        required
        value={draft.title}
        error={errors.title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder="Jazz night at the Blue Note"
      />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink">Description</span>
        <textarea
          name="description"
          rows={3}
          value={draft.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="What should guests know?"
          className={textareaClass}
        />
      </label>

      <Field
        label="Location"
        name="location"
        value={draft.location}
        onChange={(event) => onChange({ location: event.target.value })}
        placeholder="Blue Note, 131 W 3rd St"
      />

      <Field
        label="Currency / unit"
        name="priceUnit"
        value={draft.priceUnit}
        maxLength={10}
        error={errors.priceUnit}
        onChange={(event) => onChange({ priceUnit: event.target.value })}
        placeholder="USD"
        hint="Labels every amount on this event. Changing it relabels, it doesn’t convert."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Starts"
          name="startTime"
          type="datetime-local"
          required
          value={draft.startTime}
          error={errors.startTime}
          onChange={(event) => onChange({ startTime: event.target.value })}
        />
        <Field
          label="Ends"
          name="endTime"
          type="datetime-local"
          required
          value={draft.endTime}
          error={errors.endTime}
          onChange={(event) => onChange({ endTime: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border-2 border-ink/15 bg-surface p-3">
        <button
          type="button"
          role="switch"
          aria-checked={draft.isPublic}
          onClick={() => onChange({ isPublic: !draft.isPublic })}
          className="flex items-center justify-between gap-4 text-sm font-semibold"
        >
          Public event
          <span
            className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-ink transition-colors duration-300 ease-brutal ${
              draft.isPublic ? "bg-brand" : "bg-paper"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-ink bg-paper transition-all duration-300 ease-brutal ${
                draft.isPublic ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </button>
        <p className="text-xs text-ink-soft">
          {draft.isPublic
            ? "Anyone can find and browse this event."
            : "Only you and your organizers can see this event."}
        </p>
      </div>
    </div>
  );
}
