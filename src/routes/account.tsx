import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageFlow } from "@/components/PageFlow";
import { useCVStore } from "@/lib/store";
import { connectLinkedIn } from "@/lib/linkedin-server";
import { JOB_CATEGORIES } from "@/lib/jobs-types";
import {
  User,
  Linkedin,
  LogOut,
  Bookmark,
  MapPin,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "My Account — Resume" }],
  }),
  component: Account,
});

function Account() {
  const user = useCVStore((s) => s.user);
  const cv = useCVStore((s) => s.cv);
  const linkedin = useCVStore((s) => s.linkedin);
  const setLinkedIn = useCVStore((s) => s.setLinkedIn);
  const setCV = useCVStore((s) => s.setCV);
  const savedJobIds = useCVStore((s) => s.savedJobIds);
  const appliedJobIds = useCVStore((s) => s.appliedJobIds);
  const jobPreferences = useCVStore((s) => s.jobPreferences);
  const setJobPreferences = useCVStore((s) => s.setJobPreferences);
  const logout = useCVStore((s) => s.logout);
  const navigate = useNavigate();

  const [linkedinInput, setLinkedinInput] = useState(cv.linkedin || linkedin?.profileUrl || "");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      const result = await connectLinkedIn({
        data: { profileUrl: linkedinInput || cv.linkedin },
      });
      setLinkedIn({
        connected: true,
        profileUrl: result.profileUrl,
        slug: result.slug,
        displayName: result.displayName,
        connectedAt: new Date().toISOString(),
      });
      if (!cv.linkedin) setCV({ linkedin: result.profileUrl });
    } catch (e) {
      setConnectError(e instanceof Error ? e.message : "Could not connect.");
    } finally {
      setConnecting(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-[min(600px,94%)] py-20 text-center">
        <PageFlow />
        <h1 className="text-3xl">Sign in to view your account</h1>
        <p className="mt-3 text-muted-foreground">Save jobs, connect LinkedIn, and sync preferences.</p>
        <Link to="/login" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[min(900px,94%)] py-12">
      <PageFlow />

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">Account</div>
          <h1 className="mt-1 text-4xl">Hello, {user.name.split(" ")[0]}.</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive hover:bg-destructive/15"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-primary" /> Profile
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Target role</dt>
              <dd>{cv.targetRole || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Skills</dt>
              <dd>{cv.skills.length ? cv.skills.join(", ") : "Add skills in builder"}</dd>
            </div>
          </dl>
          <Link to="/builder" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <FileText className="h-3.5 w-3.5" /> Edit CV
          </Link>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Linkedin className="h-4 w-4 text-[#0A66C2]" /> LinkedIn
          </div>
          {linkedin?.connected ? (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" /> {linkedin.displayName ?? linkedin.slug}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{linkedin.profileUrl}</p>
              <button
                type="button"
                onClick={() => setLinkedIn(null)}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Connect your profile to prioritize LinkedIn listings in job search.
              </p>
              <input
                value={linkedinInput}
                onChange={(e) => setLinkedinInput(e.target.value)}
                placeholder="https://linkedin.com/in/your-name"
                className="mt-3 w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {connectError && <p className="mt-2 text-xs text-destructive">{connectError}</p>}
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Linkedin className="h-4 w-4" />}
                Connect LinkedIn
              </button>
            </div>
          )}
          <Link to="/jobs" className="mt-4 inline-block text-sm text-primary hover:underline">
            Search jobs →
          </Link>
        </div>

        <div className="glass rounded-2xl p-5 md:col-span-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-primary" /> Job search preferences
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted-foreground">Preferred location</span>
              <input
                value={jobPreferences.location}
                onChange={(e) => setJobPreferences({ location: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-input/60 px-3 py-2 outline-none focus:border-primary"
                placeholder="Cairo, Egypt"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Default category</span>
              <select
                value={jobPreferences.category}
                onChange={(e) => setJobPreferences({ category: e.target.value as typeof jobPreferences.category })}
                className="mt-1 w-full rounded-lg border border-border bg-input/60 px-3 py-2 outline-none focus:border-primary"
              >
                {JOB_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bookmark className="h-4 w-4 text-primary" /> Saved jobs
          </div>
          <p className="mt-3 font-display text-4xl text-gradient">{savedJobIds.length}</p>
          <Link to="/jobs" className="mt-2 text-sm text-primary hover:underline">
            View saved →
          </Link>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Briefcase className="h-4 w-4 text-primary" /> Applications tracked
          </div>
          <p className="mt-3 font-display text-4xl text-gradient">{appliedJobIds.length}</p>
        </div>
      </div>

      <div className="glass mt-6 rounded-2xl p-5">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4 text-primary" /> Quick actions
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/builder" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Build CV
          </Link>
          <Link to="/skills" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">
            Skill gap
          </Link>
          <Link to="/jobs" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">
            Find jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
