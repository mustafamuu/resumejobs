import type { CV } from "@/lib/store";
import { CvContact, CvEducation, CvExperience, CvProjects, CvSection, CvSkills } from "./shared";

export function CompactTemplate({ cv }: { cv: CV }) {
  return (
    <div
      className="cv-print-root mx-auto w-full max-w-[820px] bg-white px-8 py-6 text-[#111] shadow-xl print:shadow-none"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif", minHeight: 1100 }}
    >
      <header className="border-b-2 border-neutral-800 pb-2 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{cv.fullName || "Your Name"}</h1>
        {cv.title && <div className="mt-0.5 text-sm text-neutral-700">{cv.title}</div>}
        <CvContact cv={cv} className="mt-1 justify-center text-neutral-600" />
      </header>
      {cv.summary && (
        <CvSection title="Summary">
          <p className="text-[12px] leading-snug text-neutral-800">{cv.summary}</p>
        </CvSection>
      )}
      <CvExperience cv={cv} />
      <CvEducation cv={cv} />
      <CvSkills cv={cv} variant="tags" />
      <CvProjects cv={cv} />
    </div>
  );
}
