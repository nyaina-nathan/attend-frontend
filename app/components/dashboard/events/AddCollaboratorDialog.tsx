"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/app/lib/api";
import { initials } from "@/app/lib/format";
import type { UserSummary } from "@/app/lib/types";
import { searchUsers } from "@/app/lib/users";
import { Check, Search, X } from "../../ui/icons";

/** Minimum term length before a search request is fired. */
const MIN_TERM = 2;
/** Debounce: wait for the visitor to stop typing before searching. */
const DEBOUNCE_MS = 350;

function inviteErrorMessage(status: number, code: string | undefined): string {
  if (status === 404) return "That user no longer exists.";
  if (status === 400) return "Enter a valid username or email.";
  if (status === 409) {
    switch (code) {
      case "ALREADY_INVITED":
        return "This user already has a pending invitation.";
      case "ALREADY_ORGANIZER":
        return "This user already helps organize this event.";
      case "CANNOT_INVITE_CREATOR":
        return "The event creator is already an organizer.";
      default:
        return "This user can’t be invited.";
    }
  }
  return "We couldn’t send the invitation. Please try again.";
}

/** Split the joined exclusion key back into ids. */
function excludedIds(key: string): string[] {
  return key ? key.split(",") : [];
}

/**
 * "Add collaborator" popup: one input searches users by username *or* email
 * (debounced), the visitor selects a match, then confirms to send an invitation
 * (`POST /events/{eventId}/invitations`). Mounted only while open, so it starts
 * from a clean slate; mirrors `CreateEventDialog`'s focus/Escape/scroll-lock.
 */
export default function AddCollaboratorDialog({
  eventId,
  excludeUserIds = [],
  onClose,
}: {
  eventId: string;
  /** Existing organizers' user ids, filtered out of the results. */
  excludeUserIds?: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const excludeKey = excludeUserIds.join(",");

  const [term, setTerm] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [selected, setSelected] = useState<UserSummary | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<UserSummary | null>(null);

  // Focus the input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !inviting) onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [inviting, onClose]);

  // Debounced search against `GET /users`, matched on username and email. State
  // updates happen inside the timeout callback (never synchronously) so this
  // stays a pure subscription-style effect.
  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed.length < MIN_TERM) return;

    const controller = new AbortController();
    const excluded = new Set(excludedIds(excludeKey));

    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(trimmed, { signal: controller.signal });
        if (controller.signal.aborted) return;

        if (!res.ok || !res.data) {
          setSearchError("We couldn’t search users. Please try again.");
          setResults([]);
          return;
        }

        setResults(
          (res.data.content ?? []).filter((user) => !excluded.has(user.id)),
        );
      } catch {
        if (controller.signal.aborted) return;
        setSearchError("We couldn’t search users. Please try again.");
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [term, excludeKey]);

  function onTermChange(value: string) {
    setTerm(value);
    setSelected(null);

    if (value.trim().length < MIN_TERM) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
    } else {
      setSearching(true);
      setSearchError(null);
    }
  }

  async function sendInvitation() {
    if (!selected || inviting) return;
    setInviting(true);
    setInviteError(null);

    try {
      const res = await apiRequest(`/events/${eventId}/invitations`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selected.username }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setInviteError(inviteErrorMessage(res.status, res.errorCode));
        return;
      }

      setSentTo(selected);
    } catch {
      setInviteError("We couldn’t send the invitation. Please try again.");
    } finally {
      setInviting(false);
    }
  }

  const trimmed = term.trim();
  const showHint = trimmed.length < MIN_TERM;
  const showEmpty = !showHint && !searching && !searchError && results.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 px-4 py-8 sm:items-center"
      role="presentation"
      onClick={() => {
        if (!inviting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-collaborator-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Collaborators
            </p>
            <h2
              id="add-collaborator-title"
              className="mt-1 font-display text-2xl font-bold"
            >
              {sentTo ? "Invitation sent" : "Add collaborator"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={inviting}
            aria-label="Close add collaborator"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {sentTo ? (
          <>
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-ink bg-accent-soft px-5 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-success text-paper">
                <Check className="h-6 w-6" />
              </span>
              <p className="font-display text-lg font-bold">
                Invitation sent to {sentTo.fullName}
              </p>
              <p className="text-sm text-ink-soft">
                They’ll become a collaborator once they accept.
              </p>
            </div>

            <footer className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Done
              </button>
            </footer>
          </>
        ) : (
          <>
            {inviteError ? (
              <p
                role="alert"
                className="mt-4 rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
              >
                {inviteError}
              </p>
            ) : null}

            <label
              htmlFor="collaborator-search"
              className="mt-5 block text-xs font-semibold"
            >
              Search by username or email
            </label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                id="collaborator-search"
                ref={inputRef}
                type="text"
                value={term}
                onChange={(event) => onTermChange(event.target.value)}
                placeholder="e.g. ada or ada@example.com"
                autoComplete="off"
                className="w-full rounded-full border-2 border-ink bg-paper py-2.5 pl-11 pr-4 text-base text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/70 focus:border-accent md:text-sm"
              />
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto">
              {showHint ? (
                <p className="px-1 py-3 text-sm text-ink-soft">
                  Type at least {MIN_TERM} characters to search.
                </p>
              ) : searchError ? (
                <p className="px-1 py-3 text-sm font-semibold text-danger">
                  {searchError}
                </p>
              ) : searching ? (
                <p className="px-1 py-3 text-sm text-ink-soft">Searching…</p>
              ) : showEmpty ? (
                <p className="px-1 py-3 text-sm text-ink-soft">
                  No users match “{trimmed}”.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {results.map((user) => {
                    const isSelected = selected?.id === user.id;
                    return (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(user)}
                          aria-pressed={isSelected}
                          className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-all duration-300 ease-brutal ${
                            isSelected
                              ? "border-accent bg-accent-soft"
                              : "border-ink bg-paper hover:-translate-y-0.5"
                          }`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-brand">
                            <span className="font-display text-sm font-bold leading-none">
                              {initials(user.fullName)}
                            </span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-base font-bold">
                              {user.fullName}
                            </span>
                            <span className="block truncate font-mono text-xs text-ink-soft">
                              @{user.username} · {user.email}
                            </span>
                          </span>
                          {isSelected ? (
                            <Check className="h-5 w-5 shrink-0 text-accent" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <footer className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={inviting}
                className="rounded-full border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={sendInvitation}
                disabled={!selected || inviting}
                className="rounded-full border-2 border-ink bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-brutal transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
              >
                {inviting ? "Sending…" : "Send invitation"}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
