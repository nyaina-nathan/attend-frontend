import type { ReactNode } from "react";

export default function FeatureCard({
  icon,
  title,
  body,
  tone = "brand",
}: {
  icon: ReactNode;
  title: string;
  body: string;
  tone?: "brand" | "accent";
}) {
  const iconTone =
    tone === "accent" ? "bg-accent text-paper" : "bg-brand text-ink";

  return (
    <div className="group flex h-full flex-col gap-4 rounded-2xl border-2 border-ink bg-paper p-6 shadow-brutal-brand transition-all duration-500 ease-brutal hover:-translate-y-1.5">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink transition-transform duration-500 ease-brutal group-hover:-rotate-6 ${iconTone}`}
      >
        {icon}
      </span>
      <h3 className="font-display text-lg font-bold leading-tight text-ink">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
