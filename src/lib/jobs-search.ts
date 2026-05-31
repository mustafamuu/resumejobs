import { skillsMatch } from "./skills-match";
import { EXTRA_JOB_LISTINGS } from "./jobs-catalog-extra";
import type { JobCategory, JobListing, MatchedJob } from "./jobs-types";

/** Re-export pool from ai-mock — base listings */
import { JOB_POOL } from "./job-pool";

export function inferCategory(role: string, tags: string[]): JobCategory {
  const t = `${role} ${tags.join(" ")}`.toLowerCase();
  if (/driver|delivery|truck|bus|logistics|courier/.test(t)) return "transport";
  if (/pilot|flight attendant|aviation|airline/.test(t)) return "aviation";
  if (/call center|customer support|customer service|bpo/.test(t)) return "customer_service";
  if (/nurse|doctor|pharmac|medical|health/.test(t)) return "healthcare";
  if (/waiter|chef|hotel|hospitality|restaurant/.test(t)) return "hospitality";
  if (/electrician|plumber|technician|maintenance/.test(t)) return "trades";
  if (/cashier|retail|sales associate/.test(t)) return "retail";
  if (/security guard|surveillance/.test(t)) return "security";
  if (/warehouse|factory|manufacturing|operator/.test(t)) return "manufacturing";
  if (/teacher|education|tutor/.test(t)) return "education";
  if (/bank|financial|accountant|analyst/.test(t)) return "finance";
  if (/engineer|architect|civil|mechanical|electrical/.test(t)) return "engineering";
  if (/designer|editor|creative|content|video/.test(t)) return "creative";
  if (/developer|engineer|data|devops|frontend|backend|software|cloud/.test(t)) return "tech";
  return "tech";
}

function toListing(raw: (typeof JOB_POOL)[number]): JobListing {
  return {
    ...raw,
    category: inferCategory(raw.role, raw.tags),
    source: "catalog",
  };
}

export function getAllCatalogListings(): JobListing[] {
  const base = JOB_POOL.map(toListing);
  return [...base, ...EXTRA_JOB_LISTINGS];
}

function scoreJob(
  job: JobListing,
  userSkills: string[],
  targetRole: string,
  searchQuery: string,
  locationPref: string
): MatchedJob {
  const matched = job.tags.filter((t) => userSkills.some((u) => skillsMatch(u, t)));
  const missing = job.tags.filter((t) => !userSkills.some((u) => skillsMatch(u, t)));
  let score = job.tags.length === 0 ? 50 : Math.round((matched.length / job.tags.length) * 100);

  const role = targetRole.trim().toLowerCase();
  const q = searchQuery.trim().toLowerCase();
  const blob = `${job.role} ${job.company} ${job.location} ${job.tags.join(" ")}`.toLowerCase();

  if (role && blob.includes(role)) score = Math.min(100, score + 12);
  if (q && blob.includes(q)) score = Math.min(100, score + 15);
  if (role && job.role.toLowerCase().includes(role)) score = Math.min(100, score + 8);
  if (locationPref && job.location.toLowerCase().includes(locationPref.toLowerCase())) score = Math.min(100, score + 6);
  if (job.source === "linkedin") score = Math.min(100, score + 3);

  const id = `${job.company}-${job.role}-${job.location}`.replace(/\s+/g, "-").slice(0, 80);

  return {
    ...job,
    id,
    matchScore: score,
    matchedSkills: matched,
    missingSkills: missing,
  };
}

export function searchJobs(options: {
  userSkills: string[];
  targetRole: string;
  query?: string;
  category?: JobCategory;
  location?: string;
  minScore?: number;
}): MatchedJob[] {
  const { userSkills, targetRole, query = "", category = "all", location = "", minScore = 0 } = options;

  let listings = getAllCatalogListings();
  if (category !== "all") listings = listings.filter((j) => j.category === category);

  const q = query.trim().toLowerCase();
  if (q) {
    listings = listings.filter((j) => {
      const blob = `${j.role} ${j.company} ${j.location} ${j.tags.join(" ")}`.toLowerCase();
      return blob.includes(q) || q.split(/\s+/).some((word) => word.length > 2 && blob.includes(word));
    });
  }

  return listings
    .map((j) => scoreJob(j, userSkills, targetRole || query, query || targetRole, location))
    .filter((j) => j.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/** @deprecated use searchJobs — kept for compatibility */
export function matchJobs(userSkills: string[], targetRole: string): MatchedJob[] {
  return searchJobs({ userSkills, targetRole, query: targetRole });
}

export type Job = MatchedJob;

export function liveJobToListing(raw: {
  job_title?: string;
  employer_name?: string;
  job_city?: string;
  job_country?: string;
  job_salary?: string;
  job_apply_link?: string;
  job_description?: string;
  job_posted_at?: string;
  employer_logo?: string;
}): JobListing | null {
  if (!raw.job_title || !raw.employer_name) return null;
  const location = [raw.job_city, raw.job_country].filter(Boolean).join(", ") || "Remote";
  const isLinkedIn = (raw.job_apply_link ?? "").includes("linkedin.com");
  return {
    company: raw.employer_name,
    logo: (raw.employer_name[0] ?? "?").toUpperCase(),
    role: raw.job_title,
    location,
    salary: raw.job_salary ?? "See listing",
    tags: [],
    type: "Full-time",
    category: inferCategory(raw.job_title, []),
    applyUrl: raw.job_apply_link,
    source: isLinkedIn ? "linkedin" : "live",
    description: raw.job_description?.slice(0, 200),
  };
}
