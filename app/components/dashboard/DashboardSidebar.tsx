"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Logo from "../ui/Logo";
import { Calendar, Chart, Mail, Menu, Receipt, Ticket, X } from "../ui/icons";

const links = [
  { href: "/dashboard", label: "Overview", Icon: Chart },
  { href: "/dashboard/events", label: "My events", Icon: Calendar },
  { href: "/dashboard/tickets", label: "My tickets", Icon: Ticket },
  { href: "/dashboard/orders", label: "Orders", Icon: Receipt },
  { href: "/dashboard/invitations", label: "Invitations", Icon: Mail },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {links.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all duration-300 ease-brutal ${
                active
                  ? "border-ink bg-ink text-paper shadow-brutal-sm"
                  : "border-transparent text-ink hover:bg-ink/5"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarInner({
  pathname,
  children,
  onNavigate,
}: {
  pathname: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 p-4">
      <div className="px-1 pt-1">
        <Logo />
      </div>

      <nav
        aria-label="Dashboard"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          Dashboard
        </p>
        <NavLinks pathname={pathname} onNavigate={onNavigate} />
      </nav>

      <div className="border-t-2 border-ink pt-4">{children}</div>
    </div>
  );
}

/**
 * Side navigation for the authenticated area. A fixed rail on desktop; below
 * `lg` the same rail slides in as an off-canvas drawer behind a floating menu
 * button. The account block is passed in as `children` so the layout can stream
 * it behind Suspense.
 */
export default function DashboardSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // While open: move focus in, close on Escape, and lock body scroll.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r-2 border-ink bg-surface lg:block">
        <SidebarInner pathname={pathname}>{children}</SidebarInner>
      </aside>

      {/* Mobile trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open dashboard navigation"
        aria-expanded={open}
        aria-controls="dashboard-drawer"
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-brand shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className={`absolute inset-0 bg-ink/50 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={close}
          aria-hidden="true"
        />
        <div
          id="dashboard-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard navigation"
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r-2 border-ink bg-surface shadow-brutal transition-transform duration-500 ease-brutal ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close dashboard navigation"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-all duration-500 ease-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarInner pathname={pathname} onNavigate={close}>
            {children}
          </SidebarInner>
        </div>
      </div>
    </>
  );
}
