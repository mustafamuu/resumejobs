import type { CV } from "@/lib/store";
import { CvContact, CvEducation, CvExperience, CvProjects, CvSection, CvSkills } from "./shared";

export function ClassicTemplate({ cv }: { cv: CV }) {
  return (
    <div
      className="cv-print-root mx-auto w-full max-w-[820px] bg-white p-10 text-[#111] shadow-xl print:shadow-none"
      style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 1100 }}
    >
      <header className="flex items-start gap-5 border-b border-neutral-300 pb-4">
        {cv.photo && (
          <img
            src={cv.photo}
            alt={cv.fullName || "Profile"}
            className="h-24 w-24 shrink-0 rounded-full object-cover ring-1 ring-neutral-300"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">{cv.fullName || "Your Name"}</h1>
          {cv.title && <div className="mt-1 text-base text-neutral-700">{cv.title}</div>}
          <CvContact cv={cv} className="mt-2 text-neutral-600" />
        </div>
      </header>
      {cv.summary && (
        <CvSection title="Summary">
          <p className="text-[13px] leading-relaxed text-neutral-800">{cv.summary}</p>
        </CvSection>
      )}
      <CvExperience cv={cv} />
      <CvEducation cv={cv} />
      <CvProjects cv={cv} />
      <CvSkills cv={cv} />
    </div>
  );
}
