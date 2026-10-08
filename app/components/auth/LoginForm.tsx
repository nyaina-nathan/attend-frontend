"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/app/lib/api";
import type { CurrentUser } from "@/app/lib/types";
import Button from "../ui/Button";
import { ArrowRight } from "../ui/icons";
import AuthFormError from "./AuthFormError";
import Field from "./Field";
import { useAuthError } from "./useAuthError";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  VALIDATION_ERROR: "Please check your email and password, then try again.",
};

/**
 * Login form. Posts to the API with cookies included; on success it navigates
 * to the sanitized `redirectTo` target (or home). Errors appear in red at the
 * top of the form and clear themselves after ten seconds.
 */
export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { error, showError, clearError } = useAuthError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const registerHref =
    redirectTo === "/"
      ? "/register"
      : `/register?redirect=${encodeURIComponent(redirectTo)}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    clearError();
    setSubmitting(true);

    try {
      const res = await apiRequest<CurrentUser>("/auth/login", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      showError(
        (res.errorCode ? ERROR_MESSAGES[res.errorCode] : undefined) ??
          "Something went wrong. Please try again.",
      );
    } catch {
      showError("Couldn’t reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border-2 border-ink bg-paper p-6 shadow-brutal-xl sm:p-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-ink-soft">
          Log in to grab tickets or run your events.
        </p>
      </header>

      <div className="mt-5 flex flex-col gap-4">
        <AuthFormError error={error} onDismiss={clearError} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="mt-1 w-full"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-soft">
          New to Attend?{" "}
          <Link
            href={registerHref}
            className="font-semibold text-accent underline decoration-2 underline-offset-4 transition-colors duration-300 ease-brutal hover:text-ink"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
