/** Normalize skill strings for fuzzy comparison (React.js ≈ React). */
export function normalizeSkill(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\.js$/i, "")
    .replace(/\.ts$/i, "")
    .replace(/\s*\([^)]*\)\s*/g, "")
    .replace(/[^a-z0-9+#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SYNONYMS: Record<string, string[]> = {
  react: ["reactjs", "react.js", "react native"],
  typescript: ["ts", "type script"],
  javascript: ["js", "ecmascript"],
  node: ["nodejs", "node.js"],
  python: ["py"],
  postgresql: ["postgres", "psql"],
  "machine learning": ["ml", "machine-learning"],
};

function skillTokens(skill: string): string[] {
  const n = normalizeSkill(skill);
  const tokens = new Set<string>([n]);
  for (const [canonical, alts] of Object.entries(SYNONYMS)) {
    if (n === canonical || alts.some((a) => n.includes(normalizeSkill(a)) || normalizeSkill(a) === n)) {
      tokens.add(canonical);
    }
  }
  return [...tokens];
}

export function skillsMatch(userSkill: string, requiredSkill: string): boolean {
  const u = skillTokens(userSkill);
  const r = skillTokens(requiredSkill);
  return u.some((ut) => r.some((rt) => ut === rt || ut.includes(rt) || rt.includes(ut)));
}

export function analyzeSkillGapWithRequired(userSkills: string[], required: string[]) {
  const matched = required.filter((r) => userSkills.some((u) => skillsMatch(u, r)));
  const missing = required.filter((r) => !userSkills.some((u) => skillsMatch(u, r)));
  const score = required.length === 0 ? 0 : Math.round((matched.length / required.length) * 100);
  return { required, matched, missing, score };
}
