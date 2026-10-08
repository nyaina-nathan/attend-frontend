import Link from "next/link";
import { Ticket } from "./icons";

export default function Logo({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const text = tone === "light" ? "text-paper" : "text-ink";
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight ${text} ${className}`}
      aria-label="Attend home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-brand text-ink shadow-brutal-sm transition-transform duration-500 ease-brutal group-hover:-rotate-6">
        <Ticket className="h-5 w-5" />
      </span>
      Attend
    </Link>
  );
}
