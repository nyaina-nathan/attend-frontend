import type { ReactNode } from "react";

type Tone = "surface" | "paper" | "brand" | "accent" | "ink";

const tones: Record<Tone, string> = {
  surface: "bg-surface text-ink",
  paper: "bg-paper text-ink",
  brand: "bg-brand text-ink",
  accent: "bg-accent text-paper",
  ink: "bg-ink text-paper",
};

/**
 * Full-bleed section shell: background tone + macro-whitespace, with a
 * centered, max-width content column.
 */
export default function Section({
  id,
  tone = "surface",
  className = "",
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`relative w-full py-20 sm:py-28 ${tones[tone]} ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
