import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/builder", label: "Builder" },
  { to: "/skills", label: "Skill Gap" },
  { to: "/jobs", label: "Jobs" },
  { to: "/account", label: "Account" },
] as const;

export function Footer() {
  return (
    <footer className="no-print mt-24 border-t border-border/60">
      <div className="mx-auto w-[min(1200px,94%)] py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-display text-xl text-foreground">Resume</div>
            <p className="mt-1 max-w-md">
              Build ATS-friendly resumes, close skill gaps with AI, and find real jobs — all in one place.
            </p>
          </div>

          <nav aria-label="Site" className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border/40 pt-6 text-xs md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Resume</span>
          <span>Crafted for graduates</span>
        </div>
      </div>
    </footer>
  );
}
