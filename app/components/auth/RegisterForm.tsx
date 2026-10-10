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
  EMAIL_TAKEN: "That email is already registered. Try logging in instead.",
  USERNAME_TAKEN: "That username is already taken. Try another one.",
  VALIDATION_ERROR: "Please check your details and try again.",
};

/**
 * Registration form. Validates the client-side-only concerns (required fields,
 * password length and confirmation) before posting to the API. Errors appear in
 * red at the top of the form and clear themselves after ten seconds.
 */
export default function RegisterForm() {
  const router = useRouter();
  const { error, showError, clearError } = useAuthError();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    clearError();

    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      showError("Please fill in every field.");
      return;
    }
    if (password.length < 8) {
      showError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      showError("Those passwords don’t match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiRequest<CurrentUser>("/auth/register", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
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
          Create your account
        </h1>
        <p className="text-sm text-ink-soft">
          Start organizing events or grab tickets in minutes.
        </p>
      </header>

      <div className="mt-5 flex flex-col gap-4">
        <AuthFormError error={error} onDismiss={clearError} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ada Lovelace"
            />
            <Field
              label="Username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="ada"
            />
          </div>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              hint="At least 8 characters"
            />
            <Field
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="mt-1 w-full"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent underline decoration-2 underline-offset-4 transition-colors duration-300 ease-brutal hover:text-ink"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
