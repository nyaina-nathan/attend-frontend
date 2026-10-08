import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-3 rounded-full border-2 border-ink font-semibold transition-all duration-500 ease-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-ink shadow-brutal hover:shadow-brutal-sm",
  accent: "bg-accent text-paper shadow-brutal hover:shadow-brutal-sm",
  outline:
    "bg-paper text-ink shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
  ghost: "border-transparent bg-transparent text-ink hover:bg-ink/5",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  type = "button",
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const inner = (
    <>
      <span>{children}</span>
      {icon ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink transition-transform duration-500 ease-brutal group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          {icon}
        </span>
      ) : null}
    </>
  );

  if (href) {
    const external = href.startsWith("http");
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={classes}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}
