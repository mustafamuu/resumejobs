import { createServerFn } from "@tanstack/react-start";
import { inferCategory, liveJobToListing } from "./jobs-search";
import type { MatchedJob } from "./jobs-types";
import { basicAuthHeader, serverEnv } from "./server-env";
import { skillsMatch } from "./skills-match";

type JSearchJob = {
  job_title?: string;
  employer_name?: string;
  job_city?: string;
  job_country?: string;
  job_salary?: string;
  job_apply_link?: string;
  job_description?: string;
  job_posted_at_datetime_utc?: string;
  job_publisher?: string;
};

type CareerjetJob = {
  title?: string;
  company?: string;
  locations?: string;
  salary?: string;
  description?: string;
  date?: string;
  site?: string;
  url?: string;
};

function extractTags(description: string, max = 8): string[] {
  const words = description
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z+#.]/g, ""))
    .filter((w) => w.length > 3 && w.length < 24);
  const freq = new Map<string, number>();
  for (const w of words) {
    const k = w.toLowerCase();
    if (["with", "that", "this", "from", "your", "will", "have", "been"].includes(k)) continue;
    freq.set(k, (freq.get(k) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}

function relevanceScore(job: MatchedJob, userSkills: string[], query: string): MatchedJob {
  const q = query.trim().toLowerCase();
  const blob = `${job.role} ${job.company} ${job.description ?? ""}`.toLowerCase();
  let score = 40;

  if (q) {
    const terms = q.split(/\s+/).filter((t) => t.length > 2);
    const hits = terms.filter((t) => blob.includes(t)).length;
    score += terms.length ? Math.round((hits / terms.length) * 35) : 0;
  }

  if (userSkills.length && job.tags.length) {
    const matched = job.tags.filter((t) => userSkills.some((u) => skillsMatch(u, t)));
    job.matchedSkills = matched;
    job.missingSkills = job.tags.filter((t) => !matched.includes(t));
    score += Math.round((matched.length / job.tags.length) * 25);
  } else if (userSkills.length && q) {
    const skillHits = userSkills.filter((s) => blob.includes(s.toLowerCase())).length;
    score += Math.min(20, skillHits * 5);
  }

  if (job.source === "linkedin") score = Math.min(100, score + 10);
  if (job.applyUrl) score = Math.min(100, score + 5);

  return { ...job, matchScore: Math.min(100, Math.max(0, score)) };
}

function isLinkedInJob(applyUrl?: string, publisher?: string, site?: string): boolean {
  const u = (applyUrl ?? "").toLowerCase();
  const p = (publisher ?? "").toLowerCase();
  const s = (site ?? "").toLowerCase();
  return u.includes("linkedin.com") || p.includes("linkedin") || s.includes("linkedin");
}

const JSEARCH_HOST = "jsearch.p.rapidapi.com";
const JSEARCH_SEARCH_URL = `https://${JSEARCH_HOST}/search`;

/** JSearch — Google Jobs aggregator; includes real LinkedIn apply links */
async function fetchJSearch(
  query: string,
  location: string,
  linkedinOnly: boolean
): Promise<{ jobs: JSearchJob[]; error?: string }> {
  const key = serverEnv("RAPIDAPI_KEY");
  if (!key) return { jobs: [], error: "RAPIDAPI_KEY not configured" };

  const searchQuery = linkedinOnly
    ? `${query} jobs ${location} site:linkedin.com`
    : `${query} jobs in ${location}`;

  const params = new URLSearchParams({
    query: searchQuery,
    page: "1",
    num_pages: "2",
    date_posted: "month",
  });
  const url = `${JSEARCH_SEARCH_URL}?${params}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": JSEARCH_HOST,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      return { jobs: [], error: `JSearch HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    const data = (await res.json()) as { data?: JSearchJob[] };
    let jobs = data.data ?? [];
    if (linkedinOnly) {
      jobs = jobs.filter((j) => isLinkedInJob(j.job_apply_link, j.job_publisher));
    }
    jobs = jobs.filter((j) => j.job_apply_link?.startsWith("http"));
    return { jobs };
  } catch (e) {
    return { jobs: [], error: e instanceof Error ? e.message : "JSearch failed" };
  }
}

/** Careerjet — real job board listings for Egypt (ar_EG) */
async function fetchCareerjet(
  query: string,
  location: string,
  userIp: string,
  userAgent: string,
  linkedinOnly: boolean
): Promise<{ jobs: MatchedJob[]; error?: string }> {
  const affid = serverEnv("CAREERJET_AFFID");
  const apiKey = serverEnv("CAREERJET_API_KEY") ?? affid;
  if (!affid) return { jobs: [], error: "CAREERJET_AFFID not configured" };
  if (!apiKey) return { jobs: [], error: "CAREERJET_API_KEY not configured" };

  const params = new URLSearchParams({
    locale_code: "ar_EG",
    affid,
    keywords: query,
    location: location || "Egypt",
    user_ip: userIp,
    user_agent: userAgent,
    page_size: "25",
    sort: "date",
  });

  const referer = serverEnv("APP_URL") ?? "http://localhost:8080/jobs";

  try {
    const res = await fetch(`https://search.api.careerjet.net/v4/query?${params}`, {
      headers: {
        Authorization: basicAuthHeader(apiKey),
        Referer: referer,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      return { jobs: [], error: `Careerjet HTTP ${res.status}: ${text.slice(0, 120)}` };
    }
    const data = await res.json();
    const raw = (data.jobs ?? []) as CareerjetJob[];

    let listings = raw
      .filter((j) => j.url?.startsWith("http") && j.title)
      .map((j) => {
        const linkedin = isLinkedInJob(j.url, undefined, j.site);
        const tags = extractTags(j.description ?? "");
        const listing: MatchedJob = {
          id: `cj-${encodeURIComponent(j.url!).replace(/%/g, "").slice(0, 40)}`,
          company: j.company ?? "Company",
          logo: (j.company?.[0] ?? "J").toUpperCase(),
          role: j.title!,
          location: j.locations ?? location,
          salary: j.salary ?? "See listing",
          tags,
          type: "Full-time",
          category: inferCategory(j.title!, tags),
          applyUrl: j.url,
          source: linkedin ? "linkedin" : "live",
          description: j.description?.slice(0, 300),
          matchScore: 50,
          matchedSkills: [],
          missingSkills: [],
        };
        return listing;
      });

    if (linkedinOnly) listings = listings.filter((j) => j.source === "linkedin");

    return { jobs: listings };
  } catch (e) {
    return { jobs: [], error: e instanceof Error ? e.message : "Careerjet failed" };
  }
}

function jsearchToMatched(raw: JSearchJob, userSkills: string[], query: string): MatchedJob | null {
  const listing = liveJobToListing(raw);
  if (!listing?.applyUrl) return null;

  const tags = extractTags(raw.job_description ?? "");
  listing.tags = tags;

  const id = `js-${encodeURIComponent(listing.applyUrl).replace(/%/g, "").slice(0, 36)}`;
  const base: MatchedJob = {
    ...listing,
    id,
    matchScore: 50,
    matchedSkills: [],
    missingSkills: [],
  };
  return relevanceScore(base, userSkills, query);
}

export function buildLinkedInSearchUrl(query: string, location: string): string {
  const params = new URLSearchParams({
    keywords: query,
    location: location || "Egypt",
    f_TPR: "r604800", // past week
  });
  return `https://www.linkedin.com/jobs/search/?${params}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getJobSearchStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    jsearch: !!serverEnv("RAPIDAPI_KEY"),
    careerjet: !!(serverEnv("CAREERJET_AFFID") && (serverEnv("CAREERJET_API_KEY") ?? serverEnv("CAREERJET_AFFID"))),
    linkedInRequiresJSearch: true,
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchLiveJobs = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  const query: string = (ctx?.data?.query ?? "").trim();
  const location: string = (ctx?.data?.location ?? "Cairo, Egypt").trim();
  const userSkills: string[] = ctx?.data?.userSkills ?? [];
  const linkedinOnly: boolean = !!ctx?.data?.linkedinOnly;
  const linkedinPreferred: boolean = !!ctx?.data?.linkedinPreferred;
  const userIp: string = ctx?.data?.userIp ?? "127.0.0.1";
  const userAgent: string = ctx?.data?.userAgent ?? "ResumeJobSearch/1.0";

  if (!query || query.length < 2) {
    return {
      jobs: [] as MatchedJob[],
      sources: [] as string[],
      live: false,
      setupRequired: false,
      message: "Enter at least 2 characters to search real jobs.",
      linkedInSearchUrl: buildLinkedInSearchUrl("jobs", location),
    };
  }

  const hasJSearch = !!serverEnv("RAPIDAPI_KEY");
  const hasCareerjet = !!(serverEnv("CAREERJET_AFFID") && (serverEnv("CAREERJET_API_KEY") ?? serverEnv("CAREERJET_AFFID")));
  const strictLinkedIn = linkedinOnly && !linkedinPreferred;

  if (!hasJSearch && !hasCareerjet) {
    return {
      jobs: [] as MatchedJob[],
      sources: [],
      live: false,
      setupRequired: true,
      message:
        "Add RAPIDAPI_KEY (LinkedIn via JSearch) and/or CAREERJET_AFFID (Egypt jobs) to your .env file on the server.",
      linkedInSearchUrl: buildLinkedInSearchUrl(query, location),
      config: { jsearch: false, careerjet: false },
    };
  }

  const sources: string[] = [];
  const errors: string[] = [];
  const merged: MatchedJob[] = [];

  if (hasJSearch) {
    let { jobs: jsearchJobs, error } = await fetchJSearch(query, location, strictLinkedIn);
    if (error) errors.push(error);

    if (strictLinkedIn && jsearchJobs.length === 0) {
      const fallback = await fetchJSearch(query, location, false);
      if (fallback.error) errors.push(fallback.error);
      jsearchJobs = fallback.jobs.filter((j) => isLinkedInJob(j.job_apply_link, j.job_publisher));
    }

    if (jsearchJobs.length) sources.push(strictLinkedIn ? "linkedin-jsearch" : "jsearch");
    for (const raw of jsearchJobs) {
      const m = jsearchToMatched(raw, userSkills, query);
      if (m) merged.push(m);
    }
  }

  if (hasCareerjet) {
    const { jobs: cjJobs, error } = await fetchCareerjet(query, location, userIp, userAgent, strictLinkedIn);
    if (error) errors.push(error);
    if (cjJobs.length) sources.push("careerjet-eg");
    for (const j of cjJobs) merged.push(relevanceScore(j, userSkills, query));
  }

  const seen = new Set<string>();
  const unique = merged
    .filter((j) => {
      if (!j.applyUrl?.startsWith("http")) return false;
      const k = j.applyUrl;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => {
      if (linkedinPreferred) {
        const aLi = a.source === "linkedin" ? 1 : 0;
        const bLi = b.source === "linkedin" ? 1 : 0;
        if (bLi !== aLi) return bLi - aLi;
      }
      return b.matchScore - a.matchScore;
    })
    .slice(0, 30);

  const emptyMessage =
    strictLinkedIn && hasJSearch
      ? "No LinkedIn listings for this search. Try broader keywords or disconnect LinkedIn-only mode."
      : errors.join(" · ") || "No live jobs found for this search. Try different keywords.";

  return {
    jobs: unique,
    sources,
    live: unique.length > 0,
    setupRequired: unique.length === 0 && !hasJSearch && !hasCareerjet,
    message: unique.length > 0 ? undefined : emptyMessage,
    errors: errors.length ? errors : undefined,
    linkedInSearchUrl: buildLinkedInSearchUrl(query, location),
    config: { jsearch: hasJSearch, careerjet: hasCareerjet },
  };
});
