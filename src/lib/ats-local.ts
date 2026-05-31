import type { ATSBreakdownItem, ATSResult } from "./ats";

type CVInput = {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: unknown[];
  education?: unknown[];
  projects?: unknown[];
  targetRole?: string;
};

function item(category: string, score: number, maxScore: number, feedback: string): ATSBreakdownItem {
  const ratio = score / maxScore;
  const status: ATSBreakdownItem["status"] = ratio >= 0.8 ? "good" : ratio >= 0.5 ? "warning" : "error";
  return { category, score, maxScore, status, feedback };
}

/** Rule-based ATS score when Groq is unavailable. */
export function analyzeATSLocal(cv: CVInput, targetRole = "General"): ATSResult {
  const breakdown: ATSBreakdownItem[] = [];
  const suggestions: string[] = [];
  const missingKeywords: string[] = [];

  const contactScore = (cv.fullName ? 4 : 0) + (cv.email ? 4 : 0) + (cv.phone ? 2 : 0) + (cv.location ? 2 : 0);
  breakdown.push(
    item(
      "Contact Info",
      contactScore,
      12,
      contactScore >= 10 ? "Contact section is complete." : "Add full name, email, phone, and location for ATS parsers."
    )
  );

  const summaryLen = (cv.summary ?? "").trim().length;
  const summaryScore = summaryLen >= 120 ? 15 : summaryLen >= 40 ? 10 : summaryLen > 0 ? 5 : 0;
  breakdown.push(
    item(
      "Summary",
      summaryScore,
      15,
      summaryScore >= 10
        ? "Professional summary has good length."
        : "Write 3–4 sentences (120+ characters) with role and impact."
    )
  );

  const expCount = cv.experience?.length ?? 0;
  const expScore = expCount >= 2 ? 20 : expCount === 1 ? 12 : 0;
  breakdown.push(
    item(
      "Experience",
      expScore,
      20,
      expScore >= 12 ? "Experience section is present." : "Add at least one role with measurable bullet points."
    )
  );

  const eduCount = cv.education?.length ?? 0;
  const eduScore = eduCount >= 1 ? 12 : 0;
  breakdown.push(item("Education", eduScore, 12, eduScore ? "Education listed." : "Add your degree and institution."));

  const skillCount = cv.skills?.length ?? 0;
  const skillsScore = skillCount >= 8 ? 15 : skillCount >= 4 ? 10 : skillCount > 0 ? 5 : 0;
  breakdown.push(
    item(
      "Skills",
      skillsScore,
      15,
      skillsScore >= 10 ? "Solid skills list for keyword matching." : "Add 8+ skills aligned with your target role."
    )
  );

  const roleWords = targetRole
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const cvText = JSON.stringify(cv).toLowerCase();
  const matchedKw = roleWords.filter((w) => cvText.includes(w));
  const kwScore = roleWords.length ? Math.round((matchedKw.length / roleWords.length) * 14) : 7;
  roleWords
    .filter((w) => !cvText.includes(w))
    .slice(0, 5)
    .forEach((w) => missingKeywords.push(w));
  breakdown.push(
    item(
      "Keywords",
      kwScore,
      14,
      kwScore >= 10
        ? `Keywords for "${targetRole}" appear in your CV.`
        : `Weave "${targetRole}" terms into summary and bullets.`
    )
  );

  breakdown.push(item("Formatting", 12, 12, "Single-column layout, standard headings — ATS-friendly."));

  const total = breakdown.reduce((s, b) => s + b.score, 0);
  const max = breakdown.reduce((s, b) => s + b.maxScore, 0);
  const score = Math.round((total / max) * 100);

  if (!cv.email) suggestions.push("Add a professional email address.");
  if (skillCount < 6) suggestions.push(`Add skills common for ${targetRole}.`);
  if (summaryLen < 80) suggestions.push("Expand your summary with metrics and target role.");
  if (expCount === 0) suggestions.push("Include at least one work or internship experience.");

  return { score, breakdown, missingKeywords, suggestions };
}
