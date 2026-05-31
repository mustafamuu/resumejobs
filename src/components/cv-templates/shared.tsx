import type { CV } from "@/lib/store";

export function CvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em]">{title}</h2>
      {children}
    </section>
  );
}

export function CvContact({ cv, className = "" }: { cv: CV; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-1 text-[12px] ${className}`}>
      {cv.email && <span>{cv.email}</span>}
      {cv.phone && <span>· {cv.phone}</span>}
      {cv.location && <span>· {cv.location}</span>}
      {cv.website && <span>· {cv.website}</span>}
      {cv.linkedin && <span>· {cv.linkedin}</span>}
    </div>
  );
}

export function CvExperience({ cv }: { cv: CV }) {
  if (!cv.experience.length) return null;
  return (
    <CvSection title="Experience">
      <div className="space-y-4">
        {cv.experience.map((e) => (
          <div key={e.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-[13px] font-semibold">
                {e.role}
                {e.company && <span className="font-normal"> · {e.company}</span>}
              </div>
              <div className="text-[12px] opacity-80">
                {e.start} — {e.end}
                {e.location ? ` · ${e.location}` : ""}
              </div>
            </div>
            {e.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-[12.5px] leading-relaxed">
                {e.bullets.filter(Boolean).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </CvSection>
  );
}

export function CvEducation({ cv }: { cv: CV }) {
  if (!cv.education.length) return null;
  return (
    <CvSection title="Education">
      <div className="space-y-3">
        {cv.education.map((ed) => (
          <div key={ed.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-[13px] font-semibold">
                {ed.degree}
                {ed.field && `, ${ed.field}`} — {ed.school}
              </div>
              <div className="text-[12px] opacity-80">
                {ed.start} — {ed.end}
              </div>
            </div>
            {ed.details && <div className="text-[12.5px] opacity-90">{ed.details}</div>}
          </div>
        ))}
      </div>
    </CvSection>
  );
}

export function CvProjects({ cv }: { cv: CV }) {
  if (!cv.projects.length) return null;
  return (
    <CvSection title="Projects">
      <div className="space-y-3">
        {cv.projects.map((p) => (
          <div key={p.id}>
            <div className="text-[13px] font-semibold">
              {p.name}
              {p.link && <span className="ml-2 font-normal opacity-70">({p.link})</span>}
            </div>
            <div className="text-[12.5px]">{p.description}</div>
            {p.tech && <div className="text-[12px] opacity-70">Tech: {p.tech}</div>}
          </div>
        ))}
      </div>
    </CvSection>
  );
}

export function CvSkills({ cv, variant = "inline" }: { cv: CV; variant?: "inline" | "tags" }) {
  if (!cv.skills.length) return null;
  if (variant === "tags") {
    return (
      <CvSection title="Skills">
        <div className="flex flex-wrap gap-1.5">
          {cv.skills.map((s) => (
            <span key={s} className="rounded-md bg-black/5 px-2 py-0.5 text-[11px]">
              {s}
            </span>
          ))}
        </div>
      </CvSection>
    );
  }
  return (
    <CvSection title="Skills">
      <div className="text-[12.5px] leading-relaxed">{cv.skills.join(" · ")}</div>
    </CvSection>
  );
}
