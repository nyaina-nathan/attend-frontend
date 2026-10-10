import type { Metadata } from "next";
import RegisterForm from "@/app/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create an Attend account to start organizing events or grab tickets.",
};

/**
 * Registration route. A successful submission always lands on the dashboard.
 */
export default function RegisterPage() {
  return <RegisterForm />;
}
