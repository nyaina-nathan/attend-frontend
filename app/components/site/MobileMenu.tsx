"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { ArrowUpRight } from "../ui/icons";

const links = [
  { href: "/events", label: "Events" },
  { href: "#how-it-works", label: "How it works" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-brand text-ink shadow-brutal-sm transition-transform duration-500 ease-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <span className="relative block h-4 w-5">
          <span
            className={`absolute left-0 block h-[2px] w-5 bg-ink transition-all duration-500 ease-brutal ${
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 block h-[2px] w-5 -translate-y-1/2 bg-ink transition-all duration-300 ease-brutal ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 block h-[2px] w-5 bg-ink transition-all duration-500 ease-brutal ${
              open ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-0"
            }`}
          />
        </span>
      </button>

      <div
        className={`fixed inset-0 z-50 flex flex-col bg-ink/90 px-6 pt-28 backdrop-blur-3xl transition-opacity duration-500 ease-brutal ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-2">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${120 + index * 70}ms` : "0ms" }}
              className={`rounded-2xl border-2 border-paper/20 px-5 py-4 font-display text-3xl font-bold text-paper transition-all duration-500 ease-brutal ${
                open
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          style={{ transitionDelay: open ? "300ms" : "0ms" }}
          className={`mt-8 flex flex-col gap-3 transition-all duration-500 ease-brutal ${
            open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-full border-2 border-paper px-6 py-3.5 text-center font-semibold text-paper"
          >
            Log in
          </Link>
          <Button
            href="/register"
            size="lg"
            className="w-full"
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            Sign up
          </Button>
        </div>
      </div>
    </div>
  );
}
