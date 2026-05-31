import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { PageFlow } from "@/components/PageFlow";
import { useCVStore, type Experience, type Education, type Project, type CVTemplateId } from "@/lib/store";
import { CVPreview, CV_TEMPLATES } from "@/components/CVPreview";
import { ChatBot } from "@/components/ChatBot";
import { ATSScore } from "@/components/ATSScore";
import { BuilderInput, BuilderTextarea, PhotoField, SkillsEditor } from "@/components/builder/form-fields";
import { validateBuilderStep } from "@/lib/cv-schema";
import { exportCvToPdf } from "@/lib/pdf";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wand2,
  Plus,
  Trash2,
  Printer,
  Download,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileDown,
  LayoutTemplate,
} from "lucide-react";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "CV Builder — Resume" },
      { name: "description", content: "Build an ATS-friendly resume with live preview." },
    ],
  }),
  component: Builder,
});

const steps = [
  { id: "personal", label: "Personal", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "skills", label: "Skills", icon: Wand2 },
] as const;

/* ── Safe ID generator — works in all browsers ── */
function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function Builder() {
  const cv = useCVStore((s) => s.cv);
  const setCV = useCVStore((s) => s.setCV);
  const templateId = useCVStore((s) => s.templateId);
  const setTemplateId = useCVStore((s) => s.setTemplateId);
  const loadSample = useCVStore((s) => s.loadSample);
  const reset = useCVStore((s) => s.reset);
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [pdfBusy, setPdfBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const goNext = () => {
    const check = validateBuilderStep(step, cv);
    if (!check.ok) {
      setStepErrors(check.errors);
      return;
    }
    setStepErrors([]);
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const downloadPdf = async () => {
    const el = previewRef.current?.querySelector(".cv-print-root") as HTMLElement | null;
    if (!el) return;
    setPdfBusy(true);
    try {
      await exportCvToPdf(el, cv.fullName || "resume");
    } catch {
      alert("PDF export failed. Try Print instead.");
    } finally {
      setPdfBusy(false);
    }
  };

  /* ── Experience helpers ── */
  const addExperience = () =>
    setCV({
      experience: [
        ...cv.experience,
        { id: generateId(), role: "", company: "", location: "", start: "", end: "", bullets: [""] },
      ],
    });
  const updateExperience = (id: string, patch: Partial<Experience>) =>
    setCV({ experience: cv.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const removeExperience = (id: string) => setCV({ experience: cv.experience.filter((e) => e.id !== id) });

  /* ── Education helpers ── */
  const addEducation = () =>
    setCV({
      education: [
        ...cv.education,
        { id: generateId(), school: "", degree: "", field: "", start: "", end: "", details: "" },
      ],
    });
  const updateEducation = (id: string, patch: Partial<Education>) =>
    setCV({ education: cv.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const removeEducation = (id: string) => setCV({ education: cv.education.filter((e) => e.id !== id) });

  /* ── Project helpers ── */
  const addProject = () =>
    setCV({ projects: [...cv.projects, { id: generateId(), name: "", link: "", description: "", tech: "" }] });
  const updateProject = (id: string, patch: Partial<Project>) =>
    setCV({ projects: cv.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const removeProject = (id: string) => setCV({ projects: cv.projects.filter((p) => p.id !== id) });

  return (
    <div className="mx-auto w-[min(1400px,96%)] py-8">
      <PageFlow />
      {/* ── Page header — hidden on print ── */}
      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">Builder</div>
          <h1 className="mt-1 text-4xl">Craft your resume.</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-secondary"
          >
            <Sparkles className="h-4 w-4" /> Load sample
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-secondary"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={pdfBusy}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60"
          >
            <FileDown className="h-4 w-4" /> {pdfBusy ? "Exporting…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* ── LEFT: Form — hidden on print ── */}
        <div className="no-print space-y-4">
          {/* Stepper tabs */}
          <div className="glass flex flex-wrap gap-1 rounded-2xl p-2">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setStep(i);
                  setStepErrors([]);
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs transition-colors ${
                  step === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Form panel */}
          <div className="glass min-h-[400px] rounded-2xl p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Step 0 — Personal */}
                {step === 0 && (
                  <>
                    <PhotoField value={cv.photo || ""} onChange={(v) => setCV({ photo: v })} />
                    <BuilderInput
                      label="Full name"
                      value={cv.fullName}
                      onChange={(v) => setCV({ fullName: v })}
                      placeholder="Mustafa Mohamed"
                    />
                    <BuilderInput
                      label="Title"
                      value={cv.title}
                      onChange={(v) => setCV({ title: v })}
                      placeholder="Senior Frontend Engineer"
                    />
                    <BuilderInput
                      label="Target role"
                      value={cv.targetRole}
                      onChange={(v) => setCV({ targetRole: v })}
                      placeholder="Used by AI matching"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <BuilderInput
                        label="Email"
                        value={cv.email}
                        onChange={(v) => setCV({ email: v })}
                        placeholder="you@email.com"
                      />
                      <BuilderInput
                        label="Phone"
                        value={cv.phone}
                        onChange={(v) => setCV({ phone: v })}
                        placeholder="+20 100 ..."
                      />
                    </div>
                    <BuilderInput
                      label="Location"
                      value={cv.location}
                      onChange={(v) => setCV({ location: v })}
                      placeholder="Cairo, Egypt"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <BuilderInput
                        label="Website"
                        value={cv.website}
                        onChange={(v) => setCV({ website: v })}
                        placeholder="mustafa.dev"
                      />
                      <BuilderInput
                        label="LinkedIn"
                        value={cv.linkedin}
                        onChange={(v) => setCV({ linkedin: v })}
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                  </>
                )}

                {/* Step 1 — Summary */}
                {step === 1 && (
                  <BuilderTextarea
                    label="Professional summary"
                    rows={8}
                    value={cv.summary}
                    onChange={(v) => setCV({ summary: v })}
                    placeholder="3-4 sentences about your strengths, recent impact, and what you're looking for next."
                  />
                )}

                {/* Step 2 — Experience */}
                {step === 2 && (
                  <div className="space-y-4">
                    {cv.experience.map((e) => (
                      <div key={e.id} className="rounded-xl border border-border bg-surface/60 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">Position</div>
                          <button
                            onClick={() => removeExperience(e.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-2">
                          <BuilderInput
                            label="Role"
                            value={e.role}
                            onChange={(v) => updateExperience(e.id, { role: v })}
                          />
                          <BuilderInput
                            label="Company"
                            value={e.company}
                            onChange={(v) => updateExperience(e.id, { company: v })}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <BuilderInput
                              label="Start"
                              value={e.start}
                              onChange={(v) => updateExperience(e.id, { start: v })}
                              placeholder="2022"
                            />
                            <BuilderInput
                              label="End"
                              value={e.end}
                              onChange={(v) => updateExperience(e.id, { end: v })}
                              placeholder="Present"
                            />
                            <BuilderInput
                              label="Location"
                              value={e.location || ""}
                              onChange={(v) => updateExperience(e.id, { location: v })}
                            />
                          </div>
                          <div>
                            <div className="mb-1 text-xs text-muted-foreground">Bullets (one impact per line)</div>
                            {e.bullets.map((b, i) => (
                              <div key={i} className="mb-1 flex gap-2">
                                <input
                                  value={b}
                                  onChange={(ev) => {
                                    const bullets = [...e.bullets];
                                    bullets[i] = ev.target.value;
                                    updateExperience(e.id, { bullets });
                                  }}
                                  className="flex-1 rounded-lg border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
                                  placeholder="Cut bundle size by 42% by..."
                                />
                                <button
                                  onClick={() =>
                                    updateExperience(e.id, { bullets: e.bullets.filter((_, idx) => idx !== i) })
                                  }
                                  className="rounded-lg border border-border bg-surface px-2 hover:bg-secondary"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => updateExperience(e.id, { bullets: [...e.bullets, ""] })}
                              className="mt-1 inline-flex items-center gap-1 text-xs text-primary"
                            >
                              <Plus className="h-3 w-3" /> Add bullet
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addExperience}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4" /> Add experience
                    </button>
                  </div>
                )}

                {/* Step 3 — Education */}
                {step === 3 && (
                  <div className="space-y-4">
                    {cv.education.map((ed) => (
                      <div key={ed.id} className="rounded-xl border border-border bg-surface/60 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">Education</div>
                          <button
                            onClick={() => removeEducation(ed.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-2">
                          <BuilderInput
                            label="School"
                            value={ed.school}
                            onChange={(v) => updateEducation(ed.id, { school: v })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <BuilderInput
                              label="Degree"
                              value={ed.degree}
                              onChange={(v) => updateEducation(ed.id, { degree: v })}
                              placeholder="BSc"
                            />
                            <BuilderInput
                              label="Field"
                              value={ed.field || ""}
                              onChange={(v) => updateEducation(ed.id, { field: v })}
                              placeholder="Computer Science"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <BuilderInput
                              label="Start"
                              value={ed.start}
                              onChange={(v) => updateEducation(ed.id, { start: v })}
                            />
                            <BuilderInput
                              label="End"
                              value={ed.end}
                              onChange={(v) => updateEducation(ed.id, { end: v })}
                            />
                          </div>
                          <BuilderTextarea
                            label="Details"
                            rows={2}
                            value={ed.details || ""}
                            onChange={(v) => updateEducation(ed.id, { details: v })}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addEducation}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4" /> Add education
                    </button>
                  </div>
                )}

                {/* Step 4 — Projects */}
                {step === 4 && (
                  <div className="space-y-4">
                    {cv.projects.map((p) => (
                      <div key={p.id} className="rounded-xl border border-border bg-surface/60 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">Project</div>
                          <button
                            onClick={() => removeProject(p.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-2">
                          <BuilderInput
                            label="Name"
                            value={p.name}
                            onChange={(v) => updateProject(p.id, { name: v })}
                          />
                          <BuilderInput
                            label="Link"
                            value={p.link || ""}
                            onChange={(v) => updateProject(p.id, { link: v })}
                          />
                          <BuilderTextarea
                            label="Description"
                            rows={2}
                            value={p.description}
                            onChange={(v) => updateProject(p.id, { description: v })}
                          />
                          <BuilderInput
                            label="Tech"
                            value={p.tech || ""}
                            onChange={(v) => updateProject(p.id, { tech: v })}
                            placeholder="React, TypeScript"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addProject}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4" /> Add project
                    </button>
                  </div>
                )}

                {/* Step 5 — Skills */}
                {step === 5 && <SkillsEditor skills={cv.skills} onChange={(skills) => setCV({ skills })} />}
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="text-xs text-muted-foreground">
                {step + 1} / {steps.length}
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={step === steps.length - 1}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Template picker */}
          <div className="glass rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
              <LayoutTemplate className="h-3.5 w-3.5 text-primary" /> Resume template
            </div>
            <div className="grid gap-2">
              {CV_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id as CVTemplateId)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    templateId === t.id ? "border-primary bg-primary/10" : "border-border bg-surface hover:bg-secondary"
                  }`}
                >
                  <div className="font-medium">{t.label}</div>
                  <div className="text-[10px] text-muted-foreground">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {stepErrors.length > 0 && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {stepErrors.map((e) => (
                <div key={e}>• {e}</div>
              ))}
            </div>
          )}

          {/* ATS tip */}
          <div className="glass rounded-2xl p-4 text-xs text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Download className="h-3.5 w-3.5 text-primary" /> ATS tip
            </div>
            Use plain text bullets, standard headings (Experience, Education, Skills), and avoid tables, columns, or
            images. Resume already follows these rules.
          </div>

          {/* ATS Score */}
          <ATSScore cvData={cv as unknown as Record<string, unknown>} targetRole={cv.targetRole} />
        </div>

        {/* ── RIGHT: CV Preview — only this prints ── */}
        <div
          ref={previewRef}
          className="cv-preview-wrapper rounded-2xl bg-neutral-200 p-4 dark:bg-neutral-900/50 print:bg-transparent print:p-0"
        >
          <CVPreview cv={cv} templateId={templateId} />
        </div>
      </div>

      <div className="no-print glass mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div>
          <div className="font-medium">CV ready?</div>
          <p className="text-xs text-muted-foreground">Check skill gaps, then search matching jobs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/skills" className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary">
            Skill gap
          </Link>
          <Link
            to="/jobs"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Find jobs →
          </Link>
        </div>
      </div>

      {/* Chatbot — hidden on print */}
      <ChatBot />
    </div>
  );
}
