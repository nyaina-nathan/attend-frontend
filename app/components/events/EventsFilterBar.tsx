"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DATE_PRESET_DEFS,
  DEFAULT_SORT,
  DEFAULT_STATUS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  getDatePresets,
  isoToLocalDateInput,
  isoToUtcDateInput,
  localDateInputToFromISO,
  localDateInputToToISO,
} from "@/app/lib/events-query";
import type { EventSort, EventStatus } from "@/app/lib/types";
import { Search, Sliders, X } from "../ui/icons";
import { useMounted } from "./useMounted";

type PublicFilter = "all" | "public" | "private";

interface FilterDraft {
  from: string;
  to: string;
  status: EventStatus;
  sort: EventSort;
  isMine: boolean;
  isPublic: PublicFilter;
}

const inputClass =
  "rounded-xl border-2 border-ink bg-paper px-3 py-2 text-base text-ink outline-none transition-colors duration-300 ease-brutal focus:border-accent md:text-sm";

const FILTER_KEYS = ["q", "from", "to", "status", "sort", "isMine", "isPublic"] as const;

function draftFromSearchParams(searchParams: URLSearchParams): FilterDraft {
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");
  const isPublic = searchParams.get("isPublic");

  return {
    from: isoToLocalDateInput(searchParams.get("from")),
    to: isoToLocalDateInput(searchParams.get("to")),
    status: status === "POSTPONED" || status === "CANCELLED" ? status : DEFAULT_STATUS,
    sort: sort === "startTime,desc" ? "startTime,desc" : DEFAULT_SORT,
    isMine: searchParams.get("isMine") === "true",
    isPublic: isPublic === "true" ? "public" : isPublic === "false" ? "private" : "all",
  };
}

function setOrDelete(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export default function EventsFilterBar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mounted = useMounted();

  const urlQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [lastUrlQ, setLastUrlQ] = useState(urlQ);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(() => draftFromSearchParams(searchParams));

  // Adopt an external URL change (reset, chip, back/forward) into the input.
  if (urlQ !== lastUrlQ) {
    setLastUrlQ(urlQ);
    setQ(urlQ);
  }

  const replace = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const applyDraft = useCallback(
    (next: FilterDraft) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      setOrDelete(params, "from", localDateInputToFromISO(next.from));
      setOrDelete(params, "to", localDateInputToToISO(next.to));
      setOrDelete(params, "status", next.status !== DEFAULT_STATUS ? next.status : undefined);
      setOrDelete(params, "sort", next.sort !== DEFAULT_SORT ? next.sort : undefined);

      if (isAuthenticated && next.isMine) {
        params.set("isMine", "true");
        if (next.isPublic === "public") params.set("isPublic", "true");
        else if (next.isPublic === "private") params.set("isPublic", "false");
        else params.delete("isPublic");
      } else {
        params.delete("isMine");
        params.delete("isPublic");
      }

      replace(params);
    },
    [isAuthenticated, replace, searchParams],
  );

  // Debounced search: type, then update the URL after a pause.
  useEffect(() => {
    if (q === urlQ) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      const value = q.trim();
      if (value) params.set("q", value);
      else params.delete("q");
      replace(params);
    }, 300);

    return () => clearTimeout(timer);
  }, [q, urlQ, searchParams, replace]);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const hasActiveFilters = useMemo(
    () => FILTER_KEYS.some((key) => searchParams.has(key)),
    [searchParams],
  );

  const urlDraft = draftFromSearchParams(searchParams);

  // Before hydration, fall back to UTC dates so server and client markup match.
  const desktopValue: FilterDraft = mounted
    ? urlDraft
    : {
        ...urlDraft,
        from: isoToUtcDateInput(searchParams.get("from")),
        to: isoToUtcDateInput(searchParams.get("to")),
      };

  const onDesktopChange = (patch: Partial<FilterDraft>) => {
    applyDraft({ ...urlDraft, ...patch });
  };

  const openSheet = () => {
    setDraft(draftFromSearchParams(searchParams));
    setSheetOpen(true);
  };

  const onMobileChange = (patch: Partial<FilterDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const clearSearch = () => {
    setQ("");
    setLastUrlQ("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("q");
    replace(params);
  };

  return (
    <>
      <div className="z-30 rounded-2xl border-2 border-ink bg-surface/90 p-3 shadow-brutal backdrop-blur-md sm:p-4 md:sticky md:top-24">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search events by title…"
              aria-label="Search events"
              className="w-full rounded-full border-2 border-ink bg-paper py-2.5 pl-11 pr-11 text-base text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/70 focus:border-accent md:text-sm"
            />
            {q ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-brand text-ink transition-transform duration-300 ease-brutal active:translate-x-[1px] active:translate-y-[1px]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={openSheet}
            className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none md:hidden"
          >
            <Sliders className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="mt-4 hidden md:block">
          <FilterFields
            value={desktopValue}
            onChange={onDesktopChange}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {hasActiveFilters ? (
          <div className="mt-3 flex justify-end">
            <Link
              href="/events"
              scroll={false}
              className="text-xs font-semibold text-ink-soft underline decoration-2 underline-offset-4 transition-colors duration-300 ease-brutal hover:text-accent"
            >
              Reset filters
            </Link>
          </div>
        ) : null}
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[85vh] max-w-lg overflow-y-auto rounded-t-3xl border-t-2 border-ink bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-brutal-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-paper"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <FilterFields value={draft} onChange={onMobileChange} isAuthenticated={isAuthenticated} />

            <div className="mt-6 flex gap-3">
              <Link
                href="/events"
                scroll={false}
                onClick={() => setSheetOpen(false)}
                className="flex-1 rounded-full border-2 border-ink bg-paper px-5 py-3 text-center text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Reset
              </Link>
              <button
                type="button"
                onClick={() => {
                  applyDraft(draft);
                  setSheetOpen(false);
                }}
                className="flex-1 rounded-full border-2 border-ink bg-accent px-5 py-3 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterFields({
  value,
  onChange,
  isAuthenticated,
}: {
  value: FilterDraft;
  onChange: (patch: Partial<FilterDraft>) => void;
  isAuthenticated: boolean;
}) {
  const applyPreset = (id: string) => {
    const preset = getDatePresets().find((item) => item.id === id);
    if (!preset) return;
    onChange({ from: isoToLocalDateInput(preset.from), to: isoToLocalDateInput(preset.to) });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">Dates</span>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs font-semibold">
            From
            <input
              type="date"
              value={value.from}
              onChange={(event) => onChange({ from: event.target.value })}
              className={`${inputClass} w-full md:w-auto`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            To
            <input
              type="date"
              value={value.to}
              onChange={(event) => onChange({ to: event.target.value })}
              className={`${inputClass} w-full md:w-auto`}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESET_DEFS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs font-semibold">
        Status
        <select
          value={value.status}
          onChange={(event) => onChange({ status: event.target.value as EventStatus })}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold">
        Sort
        <select
          value={value.sort}
          onChange={(event) => onChange({ sort: event.target.value as EventSort })}
          className={inputClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {isAuthenticated ? (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-ink/15 bg-paper p-3">
          <button
            type="button"
            role="switch"
            aria-checked={value.isMine}
            onClick={() =>
              onChange({
                isMine: !value.isMine,
                ...(value.isMine ? { isPublic: "all" as PublicFilter } : {}),
              })
            }
            className="flex items-center justify-between gap-4 text-sm font-semibold"
          >
            My events
            <span
              className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-ink transition-colors duration-300 ease-brutal ${
                value.isMine ? "bg-brand" : "bg-surface"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-ink bg-paper transition-all duration-300 ease-brutal ${
                  value.isMine ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          </button>

          {value.isMine ? (
            <div className="flex flex-wrap gap-2">
              {(["all", "public", "private"] as PublicFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={value.isPublic === option}
                  onClick={() => onChange({ isPublic: option })}
                  className={`rounded-full border-2 border-ink px-3 py-1.5 text-xs font-semibold capitalize transition-colors duration-300 ease-brutal ${
                    value.isPublic === option ? "bg-accent text-paper" : "bg-paper text-ink"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
