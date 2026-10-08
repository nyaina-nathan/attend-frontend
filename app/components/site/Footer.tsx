import Link from "next/link";
import { getCurrentYear } from "@/app/lib/time";
import Logo from "../ui/Logo";
import { Github, Mail } from "../ui/icons";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/events", label: "Browse events" },
      { href: "/events/new", label: "Create an event" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#features", label: "Features" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Sign up" },
      { href: "/tickets", label: "My tickets" },
      { href: "/events?isMine=true", label: "My events" },
    ],
  },
];

export default async function Footer() {
  const year = await getCurrentYear();

  return (
    <footer className="relative w-full border-t-2 border-ink bg-ink text-paper">
      <div className="grid-paper-light absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <Logo tone="light" />
            <p className="max-w-xs text-sm leading-relaxed text-paper/70">
              Create events, sell tickets in tiers, and scan guests in with QR
              codes at the door.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-paper/25 text-paper transition-all duration-500 ease-brutal hover:-translate-y-0.5 hover:border-brand hover:text-brand"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@attend.dev"
                aria-label="Contact us"
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-paper/25 text-paper transition-all duration-500 ease-brutal hover:-translate-y-0.5 hover:border-brand hover:text-brand"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper/80 transition-colors duration-300 ease-brutal hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t-2 border-paper/15 pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-paper/50">
            © {year} Attend. All rights reserved.
          </p>
          <p className="font-mono text-xs text-paper/50">
            Built with Spring Boot · PostgreSQL · Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
