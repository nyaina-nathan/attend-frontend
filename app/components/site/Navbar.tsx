import Link from "next/link";
import { Suspense } from "react";
import Logo from "../ui/Logo";
import MobileMenu from "./MobileMenu";
import NavbarAuth, { NavbarAuthSkeleton } from "./NavbarAuth";

const links = [
  { href: "/events", label: "Events" },
  { href: "#how-it-works", label: "How it works" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 w-full px-4 pt-4 sm:px-6">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border-2 border-ink bg-surface px-4 py-2.5 shadow-brutal md:bg-surface/85 md:backdrop-blur-md sm:px-5">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors duration-300 ease-brutal hover:bg-ink/5"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Suspense fallback={<NavbarAuthSkeleton />}>
            <NavbarAuth />
          </Suspense>
        </div>

        <MobileMenu
          account={
            <Suspense fallback={<NavbarAuthSkeleton variant="mobile" />}>
              <NavbarAuth variant="mobile" />
            </Suspense>
          }
        />
      </nav>
    </header>
  );
}
