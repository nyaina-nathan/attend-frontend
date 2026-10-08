"use client";

import { useState } from "react";

type Audience = "attendees" | "organizers";

const audiences: {
  id: Audience;
  label: string;
  steps: { title: string; body: string }[];
}[] = [
  {
    id: "attendees",
    label: "Attendees",
    steps: [
      {
        title: "Find an event",
        body: "Search public events by title or date and open the ones that catch your eye.",
      },
      {
        title: "Pick a tier",
        body: "Compare tiers, see live remaining capacity, and choose your price.",
      },
      {
        title: "Get your QR ticket",
        body: "Your ticket lands in your account with a QR code ready to show at the door.",
      },
    ],
  },
  {
    id: "organizers",
    label: "Organizers",
    steps: [
      {
        title: "Create an event",
        body: "Set a title, schedule, location, and choose public or invite-only.",
      },
      {
        title: "Add tiers and teammates",
        body: "Define capacities and prices, then invite admins to help you run it.",
      },
      {
        title: "Scan tickets at the door",
        body: "Each scan is atomic, so no ticket is ever checked in twice.",
      },
    ],
  },
];

export default function HowItWorksTabs() {
  const [active, setActive] = useState<Audience>("attendees");
  const current = audiences.find((audience) => audience.id === active)!;

  return (
    <div className="mt-12">
      <div
        role="tablist"
        aria-label="How it works"
        className="inline-flex rounded-full border-2 border-ink bg-paper p-1 shadow-brutal-sm"
      >
        {audiences.map((audience) => {
          const selected = audience.id === active;
          return (
            <button
              key={audience.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(audience.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-500 ease-brutal ${
                selected
                  ? "bg-ink text-paper"
                  : "text-ink hover:bg-ink/5"
              }`}
            >
              {audience.label}
            </button>
          );
        })}
      </div>

      <div
        key={active}
        role="tabpanel"
        className="mt-10 grid gap-6 md:grid-cols-3"
      >
        {current.steps.map((step, index) => (
          <div
            key={step.title}
            style={{ animationDelay: `${index * 90}ms` }}
            className="flex h-full flex-col gap-4 rounded-2xl border-2 border-ink bg-paper p-6 shadow-brutal [animation:fade-up_0.6s_var(--ease-brutal)_both]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink bg-brand font-display text-xl font-bold">
              {index + 1}
            </span>
            <h3 className="font-display text-xl font-bold leading-tight">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-ink-soft">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
