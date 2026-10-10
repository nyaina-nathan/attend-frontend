import type { InputHTMLAttributes } from "react";

/**
 * Labeled form field sharing the neobrutalist input styling. The id defaults to
 * the input `name`, so the label and input stay associated automatically.
 */
export default function Field({
  label,
  hint,
  error,
  className = "",
  id,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id ?? props.name;

  return (
    <label htmlFor={fieldId} className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`w-full rounded-xl border-2 bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-colors duration-300 ease-brutal placeholder:text-ink-soft/60 focus:border-accent ${
          error ? "border-danger" : "border-ink"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span id={`${fieldId}-error`} className="text-xs font-semibold text-danger">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-ink-soft">{hint}</span>
      ) : null}
    </label>
  );
}
