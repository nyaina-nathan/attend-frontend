import type { ReactNode } from "react";
import Eyebrow from "../ui/Eyebrow";

export default function EventsHeader({ action }: { action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <Eyebrow>Browse</Eyebrow>
        <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
          Events
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Find something happening near you.
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
