import { Link, useRouterState } from "@tanstack/react-router";
import { Briefcase, ChevronRight, FileText, Target, User } from "lucide-react";

const STEPS = [
  { to: "/builder", label: "Builder", icon: FileText },
  { to: "/skills", label: "Skill Gap", icon: Target },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/account", label: "Account", icon: User },
] as const;

export function PageFlow() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Career workflow"
      className="mb-8 flex flex-wrap items-center gap-1 rounded-2xl border border-border/60 bg-surface/40 p-2"
    >
      {STEPS.map((step, i) => {
        const active = path === step.to;
        return (
          <div key={step.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
            <Link
              to={step.to}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <step.icon className="h-3.5 w-3.5" />
              {step.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
