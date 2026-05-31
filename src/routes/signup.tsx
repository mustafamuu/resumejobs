import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Resume" },
      { name: "description", content: "Create your free Resume account to build, analyze, and match." },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});
