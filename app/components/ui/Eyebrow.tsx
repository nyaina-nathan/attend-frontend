import type { ReactNode } from "react";

export default function Eyebrow({
  children,
  tone = "dark",
  className = "",
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  const styles =
    tone === "light"
      ? "border-paper bg-transparent text-paper"
      : "border-ink bg-paper text-ink";
  const dot = tone === "light" ? "bg-brand" : "bg-accent";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.2em] ${styles} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}
