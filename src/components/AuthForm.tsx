import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCVStore } from "@/lib/store";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const setUser = useCVStore((s) => s.setUser);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return;
    setLoading("email");
    setTimeout(() => {
      setUser({ name: name || email.split("@")[0] || "Student", email });
      setLoading(null);
      navigate({ to: "/builder" });
    }, 600);
  };

  const oauth = (provider: "Google" | "LinkedIn") => {
    if (loading) return;
    setLoading(provider);
    // Simulated OAuth — in production this would redirect to the provider.
    setTimeout(() => {
      const handle = provider.toLowerCase();
      setUser({
        name: `${provider} User`,
        email: `demo.${handle}@resume.app`,
      });
      setLoading(null);
      navigate({ to: "/builder" });
    }, 700);
  };

  const isSignup = mode === "signup";

  return (
    <div className="relative mx-auto w-[min(1100px,94%)] py-16">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block"
        >
          <div className="text-xs uppercase tracking-widest text-primary">
            {isSignup ? "Create account" : "Welcome back"}
          </div>
          <h1 className="mt-3 text-5xl leading-[1.05]">
            {isSignup ? (
              <>
                The shortest path
                <br />
                <span className="italic text-gradient">from CV to offer.</span>
              </>
            ) : (
              <>
                Pick up
                <br />
                where you <span className="italic text-gradient">left off.</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            One workspace for ATS resumes, AI skill gaps, and curated job matches. Designed for the graduating class of
            now.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-6 md:p-8"
        >
          <div className="md:hidden">
            <div className="text-xs uppercase tracking-widest text-primary">{isSignup ? "Sign up" : "Sign in"}</div>
            <h1 className="mt-2 text-3xl">{isSignup ? "Create your account" : "Welcome back"}</h1>
          </div>
          <div className="hidden font-display text-3xl md:block">{isSignup ? "Get started" : "Sign in"}</div>

          <div className="mt-6 grid gap-2">
            {[
              { id: "google", label: "Continue with Google" },
              { id: "linkedin", label: "Continue with LinkedIn" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => oauth(p.id === "google" ? "Google" : "LinkedIn")}
                disabled={!!loading}
                className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
              >
                <ProviderIcon p={p.id} />
                {loading === (p.id === "google" ? "Google" : "LinkedIn") ? "Connecting..." : p.label}
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {isSignup && <Field icon={User} placeholder="Full name" value={name} onChange={setName} />}
            <Field icon={Mail} placeholder="Email" type="email" value={email} onChange={setEmail} required />
            <Field icon={Lock} placeholder="Password" type="password" value={pw} onChange={setPw} required />
            <button
              type="submit"
              disabled={!!loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loading === "email" ? "Working..." : isSignup ? "Create account" : "Sign in"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New here? "}
            <Link to={isSignup ? "/login" : "/signup"} className="text-foreground underline-offset-4 hover:underline">
              {isSignup ? "Sign in" : "Create one"}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}: {
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-input/60 px-3 py-2.5 transition-colors focus-within:border-primary">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

function ProviderIcon({ p }: { p: string }) {
  if (p === "google")
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12 11v3.4h4.7c-.2 1.2-1.5 3.6-4.7 3.6-2.8 0-5.1-2.3-5.1-5.2s2.3-5.2 5.1-5.2c1.6 0 2.7.7 3.3 1.3l2.3-2.2C16.1 5.2 14.2 4.4 12 4.4 7.7 4.4 4.2 7.9 4.2 12.2S7.7 20 12 20c6.9 0 8.3-6.5 7.6-9H12z"
        />
      </svg>
    );
  if (p === "linkedin")
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V10.5H5.67v7.84h2.67zM7 9.34a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9V14c0-2.5-1.34-3.66-3.13-3.66-1.44 0-2.09.79-2.45 1.35V10.5h-2.67c.04.75 0 7.84 0 7.84h2.67v-4.38c0-.24.02-.48.09-.65.19-.48.63-.98 1.36-.98.96 0 1.34.73 1.34 1.79v4.22h2.67z" />
      </svg>
    );
  return null;
}
