import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCVStore } from "@/lib/store";
import { searchLiveJobs } from "@/lib/jobs-server";
import { type JobCategory, type MatchedJob } from "@/lib/jobs-types";
import {
  MapPin,
  ExternalLink,
  CheckCircle2,
  Search,
  Heart,
  Loader2,
  Bookmark,
  AlertCircle,
  Target,
  FileText,
  Briefcase,
} from "lucide-react";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Job Search — Resume" },
      { name: "description", content: "Find real job listings matched to your CV and skills." },
    ],
  }),
  component: Jobs,
});

function Jobs() {
  const cv = useCVStore((s) => s.cv);
  const linkedin = useCVStore((s) => s.linkedin);
  const jobPreferences = useCVStore((s) => s.jobPreferences);
  const setJobPreferences = useCVStore((s) => s.setJobPreferences);
  const savedJobIds = useCVStore((s) => s.savedJobIds);
  const appliedJobIds = useCVStore((s) => s.appliedJobIds);
  const toggleSavedJob = useCVStore((s) => s.toggleSavedJob);
  const markApplied = useCVStore((s) => s.markApplied);

  const [query, setQuery] = useState(cv.targetRole || cv.title || "");
  const [submittedQuery, setSubmittedQuery] = useState(cv.targetRole || cv.title || "");
  const [category] = useState<JobCategory>(jobPreferences.category || "all");
  const [savedOnly, setSavedOnly] = useState(false);

  const location = jobPreferences.location || cv.location || "Cairo, Egypt";

  const liveQuery = useQuery({
    queryKey: ["live-jobs", submittedQuery, location, linkedin?.connected],
    queryFn: () =>
      searchLiveJobs({
        data: {
          query: submittedQuery,
          location,
          userSkills: cv.skills,
          linkedinOnly: false,
          linkedinPreferred: !!linkedin?.connected,
          userIp: "127.0.0.1",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "ResumeApp/1.0",
        },
      }),
    enabled: submittedQuery.trim().length >= 2,
    staleTime: 120_000,
  });

  useEffect(() => {
    if (submittedQuery.trim().length >= 2) return;
    const t = cv.targetRole || cv.title;
    if (t && t.length >= 2) setSubmittedQuery(t);
  }, [cv.targetRole, cv.title, submittedQuery]);

  const runSearch = () => {
    const q = query.trim();
    if (q.length < 2) return;
    setSubmittedQuery(q);
  };

  const allJobs = useMemo(() => {
    let list = ((liveQuery.data?.jobs ?? []) as MatchedJob[]).filter((j) => j.applyUrl?.startsWith("http"));
    if (category !== "all") list = list.filter((j) => j.category === category);
    if (savedOnly) list = list.filter((j) => savedJobIds.includes(j.id));
    return list;
  }, [liveQuery.data, category, savedOnly, savedJobIds]);

  const linkedInSearchUrl = liveQuery.data?.linkedInSearchUrl as string | undefined;
  const hasCvContext = !!(cv.targetRole || cv.title || cv.skills.length);

  return (
    <div className="mx-auto w-[min(1200px,94%)] py-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-primary">Job Search</div>
        <h1 className="mt-1 text-4xl md:text-5xl">
          Find roles that <span className="text-gradient italic">fit your CV</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Search live listings matched to your skills and target role. Results open on the original job site.
        </p>
      </div>

      {!hasCvContext && (
        <div className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div className="flex items-start gap-3 text-sm">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Get better matches</p>
              <p className="mt-1 text-muted-foreground">
                Add your target role and skills in the builder, or run a skill gap analysis first.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <FileText className="h-4 w-4" /> Build CV
            </Link>
            <Link
              to="/skills"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              <Target className="h-4 w-4" /> Skill gap
            </Link>
          </div>
        </div>
      )}

      <div className="glass mb-6 rounded-2xl p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
          className="flex flex-col gap-3 md:flex-row"
        >
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-input/60 px-4">
            <Search className="h-5 w-5 shrink-0 text-primary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={cv.targetRole || "Software engineer, nurse, driver…"}
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-input/60 px-4 md:w-52">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <input
              value={jobPreferences.location}
              onChange={(e) => setJobPreferences({ location: e.target.value })}
              placeholder="Cairo, Egypt"
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={query.trim().length < 2 || liveQuery.isFetching}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {liveQuery.isFetching ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching…
              </span>
            ) : (
              "Search jobs"
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSavedOnly((v) => !v)}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${savedOnly ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
              }`}
          >
            <Bookmark className="h-3 w-3" /> Saved
          </button>
        </div>
      </div>

      {liveQuery.data?.message && allJobs.length === 0 && !liveQuery.isFetching && submittedQuery.length >= 2 && (
        <div className="glass mb-6 flex gap-3 rounded-2xl p-5">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
          <div className="text-sm">
            <p>{liveQuery.data.message as string}</p>
            {linkedInSearchUrl && (
              <a
                href={linkedInSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                <ExternalLink className="h-4 w-4" /> Search on LinkedIn
              </a>
            )}
          </div>
        </div>
      )}

      {submittedQuery.length < 2 && (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          Enter a job title and press <strong className="text-foreground">Search jobs</strong>.
        </div>
      )}

      {liveQuery.isFetching && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          Finding listings…
        </div>
      )}

      {!liveQuery.isFetching && allJobs.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {allJobs.length} jobs for &quot;{submittedQuery}&quot;
            {cv.skills.length > 0 && " · ranked by skill match"}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {allJobs.map((j, i) => (
              <JobCard
                key={`${j.id}-${i}`} // 👈 تم التعديل هنا لضمان عدم تكرار الـ Key
                job={j}
                index={i}
                saved={savedJobIds.includes(j.id)}
                applied={appliedJobIds.includes(j.id)}
                onSave={() => toggleSavedJob(j.id)}
                onApply={() => {
                  markApplied(j.id);
                  window.open(j.applyUrl!, "_blank", "noopener,noreferrer");
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="glass mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Briefcase className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">Not getting the right matches?</div>
            <div className="text-xs text-muted-foreground">Improve your CV and close skill gaps first.</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/skills" className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary">
            Skill gap analysis
          </Link>
          <Link
            to="/builder"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Edit CV →
          </Link>
        </div>
      </div>
    </div>
  );
}

function JobCard({
  job,
  index,
  saved,
  applied,
  onSave,
  onApply,
}: {
  job: MatchedJob;
  index: number;
  saved: boolean;
  applied: boolean;
  onSave: () => void;
  onApply: () => void;
}) {
  const toneClass =
    job.matchScore >= 70 ? "text-primary" : job.matchScore >= 45 ? "text-accent" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25) }}
      className="glass flex flex-col rounded-2xl p-5"
    >
      <div className="flex gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary font-display text-lg">{job.logo}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{job.role}</span>
            {job.source === "linkedin" && (
              <span className="rounded bg-[#0A66C2]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#0A66C2]">
                LinkedIn
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{job.company}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            <MapPin className="mr-1 inline h-3 w-3" />
            {job.location} · {job.salary}
          </div>
        </div>
        <div className="text-right">
          <div className={`font-display text-2xl ${toneClass}`}>{job.matchScore}%</div>
          <button type="button" onClick={onSave} className="mt-1 text-muted-foreground hover:text-primary">
            <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {job.description && <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{job.description}</p>}

      {job.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {job.tags.slice(0, 5).map((t, idx) => (
            <span key={`${t}-${idx}`} className="rounded bg-secondary px-1.5 py-0.5 text-[10px]"> {/* 👈 تم التعديل هنا كمان */}
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex justify-end pt-4">
        <button
          type="button"
          onClick={onApply}
          disabled={!job.applyUrl}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${applied
            ? "border border-primary/40 bg-primary/15 text-primary hover:opacity-80 cursor-pointer"
            : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
        >
          {applied ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Applied
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" /> Apply
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}