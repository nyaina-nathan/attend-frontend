"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/app/lib/api";

/**
 * Ends the session server-side (clears cookies) and returns home. Failures are
 * ignored: the local intent is to leave the authenticated area either way.
 */
export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) return;
    setPending(true);
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // Ignore — navigate away regardless.
    }
    router.push("/");
    router.refresh();
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="w-full rounded-full border-2 border-ink bg-paper px-3 py-2 text-xs font-semibold shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
    >
      {pending ? "…" : "Log out"}
    </button>
  );
}
