import type { CV } from "@/lib/store";
import { CvEducation, CvExperience, CvProjects, CvSection } from "./shared";

export function ModernTemplate({ cv }: { cv: CV }) {
  return (
    <div
      className="cv-print-root mx-auto grid w-full max-w-[820px] grid-cols-[220px_1fr] bg-white text-[#111] shadow-xl print:shadow-none"
      style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 1100 }}
    >
      <aside className="bg-[#0f172a] p-6 text-white">
        {cv.photo && (
          <img
            src={cv.photo}
            alt={cv.fullName || "Profile"}
            className="mx-auto mb-4 h-28 w-28 rounded-full object-cover ring-2 ring-white/20"
          />
        )}
        <h1 className="text-xl font-bold leading-tight">{cv.fullName || "Your Name"}</h1>
        {cv.title && <p className="mt-1 text-sm text-cyan-200">{cv.title}</p>}
        <div className="mt-6 space-y-4 text-[11px] leading-relaxed text-slate-200">
          {cv.email && <div>{cv.email}</div>}
          {cv.phone && <div>{cv.phone}</div>}
          {cv.location && <div>{cv.location}</div>}
          {cv.website && <div>{cv.website}</div>}
          {cv.linkedin && <div>{cv.linkedin}</div>}
        </div>
        {cv.skills.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300">Skills</h2>
            <ul className="space-y-1 text-[11px]">
              {cv.skills.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
      <main className="p-8">
        {cv.summary && (
          <CvSection title="Profile">
            <p className="text-[13px] leading-relaxed text-neutral-800">{cv.summary}</p>
          </CvSection>
        )}
        <CvExperience cv={cv} />
        <CvEducation cv={cv} />
        <CvProjects cv={cv} />
      </main>
    </div>
  );
}
