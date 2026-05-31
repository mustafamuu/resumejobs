import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageFlow } from "@/components/PageFlow";
import { useCVStore } from "@/lib/store";
import { analyzeSkillGapAsync, isKnownRole, recommendVideos, listRoles } from "@/lib/ai-mock";
import {
  Sparkles,
  Target,
  Youtube,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  Search,
  X,
  TrendingUp,
  BookOpen,
  ChevronDown,
  Star,
  Zap,
  Loader2,
  Bot,
} from "lucide-react";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "AI Skill Gap Analysis — Resume" },
      { name: "description", content: "Discover what's missing from your skill set for your dream role." },
    ],
  }),
  component: Skills,
});

/* ── Types ── */
interface GapResult {
  required: string[];
  matched: string[];
  missing: string[];
  score: number;
}

/* ── Priority badge ── */
function PriorityBadge({ score }: { score: number }) {
  if (score >= 80)
    return (
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
        High demand
      </span>
    );
  if (score >= 50)
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">Medium</span>
    );
  return <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">Nice to have</span>;
}

/* ── AI badge — shown when Groq generated the skills ── */
function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
      <Bot className="h-3 w-3" /> AI Generated
    </span>
  );
}

/* ── Skeleton loader ── */
function SkeletonSkills() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-secondary" />
          <div className="h-5 w-36 rounded bg-secondary" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-secondary" />
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-secondary" />
          <div className="h-5 w-44 rounded bg-secondary" />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    </div>
  );
}

function Skills() {
  const cv = useCVStore((s) => s.cv);
  const setCV = useCVStore((s) => s.setCV);

  const [target, setTarget] = useState(cv.targetRole || "Frontend Engineer");
  const [roleOpen, setRoleOpen] = useState(false);
  const [openSkill, setOpenSkill] = useState<string | null>(null);
  const [skillQuery, setSkillQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "missing" | "matched">("all");
  const [showRoadmap, setShowRoadmap] = useState(false);

  /* ── Async state ── */
  const [result, setResult] = useState<GapResult>({ required: [], matched: [], missing: [], score: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isAiRole, setIsAiRole] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allRoles = useMemo(() => listRoles(), []);

  const filteredRoles = useMemo(() => {
    const q = target.trim().toLowerCase();
    if (!q) return allRoles.slice(0, 12);
    return allRoles.filter((r) => r.toLowerCase().includes(q)).slice(0, 12);
  }, [target, allRoles]);

  /* ── Core: async skill gap fetch with debounce ── */
  const runAnalysis = useCallback(async (role: string, skills: string[]) => {
    if (!role.trim()) return;

    // Debounce — wait 600ms after user stops typing before hitting Groq
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const known = isKnownRole(role);
    setIsAiRole(!known);

    // For known roles: instant response, no spinner
    if (known) {
      const gap = await analyzeSkillGapAsync(role, skills);
      setResult(gap);
      return;
    }

    // For unknown roles: show loader then call Groq
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const gap = await analyzeSkillGapAsync(role, skills);
        setResult(gap);
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, []);

  useEffect(() => {
    runAnalysis(target, cv.skills);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, cv.skills]);

  /* ── Skill search suggestions ── */
  const skillSuggestions = useMemo(() => {
    const set = new Set<string>();
    cv.skills.forEach((s) => set.add(s));
    result.required.forEach((s) => set.add(s));
    result.missing.forEach((s) => set.add(s));
    return Array.from(set);
  }, [cv.skills, result]);

  const filteredSkillSuggestions = useMemo(() => {
    const q = skillQuery.trim().toLowerCase();
    if (!q) return [];
    return skillSuggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
  }, [skillQuery, skillSuggestions]);

  const pickRole = (r: string) => {
    setTarget(r);
    setCV({ targetRole: r });
    setRoleOpen(false);
  };

  const learnSkill = (s: string) => {
    setActiveSearch(s);
    setSkillQuery(s);
  };

  const addSkill = (s: string) => {
    if (!cv.skills.includes(s)) setCV({ skills: [...cv.skills, s] });
  };

  /* ── Roadmap ── */
  const roadmap = useMemo(
    () =>
      [...result.missing].slice(0, 8).map((s, i) => ({
        skill: s,
        week: i + 1,
        priority: Math.max(90 - i * 10, 30),
      })),
    [result.missing]
  );

  const displayedMatched = filter !== "missing" ? result.matched : [];
  const displayedMissing = filter !== "matched" ? result.missing : [];

  return (
    <div className="mx-auto w-[min(1200px,94%)] py-10">
      <PageFlow />
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-primary">AI Skill Gap</div>
        <h1 className="mt-1 text-4xl md:text-5xl">
          What stands between you
          <br /> and the job?
        </h1>
      </div>

      {/* ── Top row: Role picker + Skill search ── */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Role picker */}
        <div className="glass rounded-2xl p-5">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Target className="h-3.5 w-3.5" /> Target role
          </div>
          <div className="relative z-30">
            <input
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setRoleOpen(true);
                setCV({ targetRole: e.target.value });
              }}
              onFocus={() => setRoleOpen(true)}
              onBlur={() => setTimeout(() => setRoleOpen(false), 150)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full rounded-lg border border-border bg-input/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />

            {/* Loading spinner inside input */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            <AnimatePresence>
              {roleOpen && filteredRoles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-xl"
                >
                  {filteredRoles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickRole(r)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary"
                    >
                      <span>{r}</span>
                      <Sparkles className="h-3 w-3 text-primary" />
                    </button>
                  ))}
                  {/* "Use AI" option when typed role not in list */}
                  {target.trim() && !allRoles.some((r) => r.toLowerCase() === target.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickRole(target.trim())}
                      className="flex w-full items-center justify-between border-t border-border px-3 py-2 text-left text-sm hover:bg-secondary"
                    >
                      <span className="text-primary">🤖 Use AI for "{target.trim()}"</span>
                      <Bot className="h-3 w-3 text-primary" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {isAiRole && !isLoading && <AiBadge />}
            {cv.skills.length === 0 ? (
              <>
                <Link to="/builder" className="text-primary underline-offset-4 hover:underline">
                  Add skills to your CV
                </Link>{" "}
                first.
              </>
            ) : (
              <>
                Analyzing <strong className="text-foreground">{cv.skills.length}</strong> skills · live results below.
              </>
            )}
          </div>
        </div>

        {/* Skill search */}
        <div className="glass rounded-2xl p-5">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Youtube className="h-3.5 w-3.5" /> Search any skill to learn
          </div>
          <div className="relative z-20">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={skillQuery}
              onChange={(e) => {
                setSkillQuery(e.target.value);
                setActiveSearch(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && skillQuery.trim()) learnSkill(skillQuery.trim());
              }}
              placeholder="e.g. React, SolidWorks, Figma..."
              className="w-full rounded-lg border border-border bg-input/60 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-primary"
            />
            {skillQuery && (
              <button
                onClick={() => {
                  setSkillQuery("");
                  setActiveSearch(null);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <AnimatePresence>
              {skillQuery && !activeSearch && filteredSkillSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-xl"
                >
                  {filteredSkillSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => learnSkill(s)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary"
                    >
                      <span>{s}</span>
                      <Youtube className="h-3 w-3 text-primary" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Press Enter or pick a suggestion to load free YouTube tutorials.
          </div>
        </div>
      </div>

      {/* ── AI fetching notice ── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              Asking AI to find the best skills for <strong>"{target}"</strong>…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Free search results ── */}
      <AnimatePresence>
        {activeSearch && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="glass mb-8 rounded-2xl p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-primary" />
                <h2 className="text-xl">
                  Learn <span className="text-primary">{activeSearch}</span>
                </h2>
              </div>
              <button
                onClick={() => addSkill(activeSearch)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs hover:bg-secondary"
              >
                <Plus className="h-3 w-3" />
                {cv.skills.includes(activeSearch) ? "Already added ✓" : "Add to my CV"}
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {recommendVideos(activeSearch).map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-3 rounded-lg border border-border bg-surface p-2 hover:bg-secondary"
                >
                  <img src={v.thumb} alt="" className="h-14 w-24 rounded object-cover" />
                  <div className="flex-1 text-xs">
                    <div className="line-clamp-2 font-medium text-foreground">{v.title}</div>
                    <div className="mt-1 text-muted-foreground">
                      {v.channel} · {v.duration} · {v.views} views
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 self-start text-muted-foreground" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <motion.div
        key={target}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[280px_1fr]"
      >
        {/* ── Score card ── */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              Match score {isAiRole && <AiBadge />}
            </div>
            <div className="relative mx-auto my-4 h-36 w-36">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="var(--color-border)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={result.score >= 70 ? "var(--color-primary)" : result.score >= 40 ? "#fbbf24" : "#f87171"}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.score / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <div className="font-display text-4xl">
                    {result.score}
                    <span className="text-xl text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Calculating…"
                : result.score >= 80
                  ? "🎉 You're a strong fit!"
                  : result.score >= 50
                    ? "💪 Solid base — close a few gaps."
                    : "🚀 Lots of room to grow. Let's get you there."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-secondary p-2">
                <div className="text-lg font-semibold text-emerald-400">{result.matched.length}</div>
                <div className="text-muted-foreground">Matched</div>
              </div>
              <div className="rounded-lg bg-secondary p-2">
                <div className="text-lg font-semibold text-accent">{result.missing.length}</div>
                <div className="text-muted-foreground">Missing</div>
              </div>
            </div>
          </div>

          {/* ── Learning Roadmap ── */}
          {result.missing.length > 0 && !isLoading && (
            <div className="glass rounded-2xl p-4">
              <button
                onClick={() => setShowRoadmap((v) => !v)}
                className="flex w-full items-center justify-between text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Learning Roadmap
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${showRoadmap ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {showRoadmap && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      {roadmap.map((item, i) => (
                        <div key={item.skill} className="flex items-center gap-2 text-xs">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {i + 1}
                          </div>
                          <div className="flex-1 truncate text-foreground">{item.skill}</div>
                          <button
                            onClick={() => learnSkill(item.skill)}
                            className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20"
                          >
                            Learn
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-[10px] text-muted-foreground">
                      Estimated time: ~{roadmap.length} weeks
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Progress bar ── */}
          <div className="glass rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium">
              <Star className="h-3.5 w-3.5 text-primary" /> Readiness
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${result.score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="mt-1 text-right text-[10px] text-muted-foreground">{result.score}% ready</div>
          </div>
        </div>

        {/* ── Skills panels ── */}
        <div className="space-y-5">
          {/* Filter tabs */}
          <div className="flex gap-2">
            {(["all", "matched", "missing"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f === "all"
                  ? "All skills"
                  : f === "matched"
                    ? `✓ Have (${result.matched.length})`
                    : `✗ Missing (${result.missing.length})`}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {isLoading && <SkeletonSkills />}

          {/* Skills you have */}
          {!isLoading && displayedMatched.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xl">Skills you have</h2>
                <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                  {result.matched.length} matched
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matched.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                  >
                    <CheckCircle2 className="h-3 w-3" /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isLoading && filter === "all" && result.matched.length === 0 && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h2 className="text-xl">Skills you have</h2>
              </div>
              <div className="text-sm text-muted-foreground">No matches yet.</div>
            </div>
          )}

          {/* Skill gaps */}
          {!isLoading && filter !== "matched" && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-accent" />
                <h2 className="text-xl">Skill gaps — click to learn</h2>
                {result.missing.length > 0 && (
                  <span className="ml-auto rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                    {result.missing.length} missing
                  </span>
                )}
              </div>
              {result.missing.length === 0 ? (
                <div className="text-sm text-muted-foreground">No gaps detected for this role 🎉</div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {displayedMissing.map((s, i) => (
                    <div key={s} className="rounded-xl border border-border bg-surface/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-sm">{s}</div>
                          <div className="mt-0.5">
                            <PriorityBadge score={Math.max(90 - i * 8, 30)} />
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            onClick={() => addSkill(s)}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs hover:bg-secondary"
                            title="Add to CV"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setOpenSkill(openSkill === s ? null : s)}
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:opacity-90"
                          >
                            <Youtube className="h-3 w-3" /> Learn
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {openSkill === s && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2 overflow-hidden"
                          >
                            {recommendVideos(s).map((v) => (
                              <a
                                key={v.id}
                                href={v.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex gap-3 rounded-lg border border-border bg-surface p-2 hover:bg-secondary"
                              >
                                <img src={v.thumb} alt="" className="h-14 w-24 rounded object-cover" />
                                <div className="flex-1 text-xs">
                                  <div className="line-clamp-2 font-medium text-foreground">{v.title}</div>
                                  <div className="mt-1 text-muted-foreground">
                                    {v.channel} · {v.duration} · {v.views} views
                                  </div>
                                </div>
                                <ExternalLink className="h-3.5 w-3.5 self-start text-muted-foreground" />
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick add all missing */}
          {!isLoading && result.missing.length > 0 && filter !== "matched" && (
            <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span>Add all missing skills to your CV at once?</span>
              </div>
              <button
                onClick={() => setCV({ skills: Array.from(new Set([...cv.skills, ...result.missing])) })}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Add all ({result.missing.length})
              </button>
            </div>
          )}

          {/* Ready to apply */}
          <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Ready to apply?</div>
                <div className="text-xs text-muted-foreground">See ranked job matches based on your CV.</div>
              </div>
            </div>
            <Link
              to="/jobs"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              See matched jobs →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
