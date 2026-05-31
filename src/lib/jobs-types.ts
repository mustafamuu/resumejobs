export type JobCategory =
  | "all"
  | "tech"
  | "transport"
  | "aviation"
  | "customer_service"
  | "hospitality"
  | "healthcare"
  | "trades"
  | "retail"
  | "finance"
  | "education"
  | "security"
  | "manufacturing"
  | "creative"
  | "engineering";

export type JobListing = {
  company: string;
  logo: string;
  role: string;
  location: string;
  salary: string;
  tags: string[];
  type: string;
  category: JobCategory;
  applyUrl?: string;
  source?: "catalog" | "linkedin" | "live";
  description?: string;
};

export type MatchedJob = JobListing & {
  id: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
};

export const JOB_CATEGORIES: { id: JobCategory; label: string; icon: string }[] = [
  { id: "all", label: "All fields", icon: "✨" },
  { id: "tech", label: "Tech & IT", icon: "💻" },
  { id: "transport", label: "Drivers & Logistics", icon: "🚚" },
  { id: "aviation", label: "Aviation", icon: "✈️" },
  { id: "customer_service", label: "Call Center & CS", icon: "📞" },
  { id: "hospitality", label: "Hotels & Restaurants", icon: "🍽️" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "trades", label: "Skilled Trades", icon: "🔧" },
  { id: "retail", label: "Retail & Sales", icon: "🛒" },
  { id: "finance", label: "Finance & Admin", icon: "📊" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "manufacturing", label: "Factory & Warehouse", icon: "🏭" },
  { id: "creative", label: "Creative & Media", icon: "🎨" },
  { id: "engineering", label: "Engineering", icon: "⚙️" },
];
