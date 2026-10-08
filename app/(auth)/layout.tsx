import type { ReactNode } from "react";
import AuthAside from "../components/auth/AuthAside";

/**
 * Auth shell shared by /login and /register: an informational brand panel on
 * the left and the form column on the right. On small screens the panel
 * collapses to a compact banner above the form.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <AuthAside />

      <main
        id="main"
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-surface px-4 py-12 sm:px-6 lg:py-16"
      >
        <div
          aria-hidden="true"
          className="grid-paper pointer-events-none absolute inset-0 opacity-60"
        />
        <div className="relative w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
