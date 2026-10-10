import type { Metadata } from "next";
import LoginForm from "@/app/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to your Attend account to grab tickets or run your events.",
};

/**
 * Login route. A successful submission always lands on the dashboard.
 */
export default function LoginPage() {
  return <LoginForm />;
}
