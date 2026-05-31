import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Resume" },
      { name: "description", content: "Sign in to continue building your ATS-friendly resume." },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
