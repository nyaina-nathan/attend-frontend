"use client";

import Link from "next/link";
import { chipsFromParams, removeFilterHref } from "@/app/lib/events-query";
import { X } from "../ui/icons";
import { useMounted } from "./useMounted";

export default function FilterChips({
  params,
  total,
}: {
  params: Record<string, string>;
  total: number;
}) {
  const mounted = useMounted();

  // The date label depends on the viewer's timezone, so keep a neutral label
  // until after hydration to avoid a server/client mismatch.
  const chips = chipsFromParams(params).map((chip) =>
    chip.key === "range" && !mounted ? { ...chip, label: "Date range" } : chip,
  );

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">
        {total} {total === 1 ? "event" : "events"}
      </span>

      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={removeFilterHref(params, chip.remove)}
          scroll={false}
          className="group inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:-translate-y-0.5"
        >
          {chip.label}
          <X className="h-3.5 w-3.5 text-ink-soft transition-colors duration-300 ease-brutal group-hover:text-danger" />
        </Link>
      ))}
    </div>
  );
}
