// Skill gap, YouTube learning paths, and job matching.
// ✅ Known roles → static map (instant)
// 🤖 Unknown roles → server-side Groq via skill-gap-server.ts

import { fetchRoleSkillsAI } from "./skill-gap-server";
import { analyzeSkillGapWithRequired, skillsMatch } from "./skills-match";

const aiSkillsCache = new Map<string, string[]>();

const ROLE_SKILLS: Record<string, string[]> = {
  // ---------- Engineering / Tech ----------
  "frontend engineer": [
    "React",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Next.js",
    "Testing (Jest)",
    "Git",
    "Accessibility",
    "Performance",
  ],
  "senior frontend engineer": [
    "React",
    "TypeScript",
    "Next.js",
    "Tailwind CSS",
    "GraphQL",
    "Testing (Jest)",
    "Performance",
    "Accessibility",
    "System Design",
    "Mentoring",
    "CI/CD",
  ],
  "backend engineer": [
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "REST APIs",
    "GraphQL",
    "Docker",
    "AWS",
    "Redis",
    "Testing",
    "CI/CD",
    "System Design",
  ],
  "full stack engineer": [
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "REST APIs",
    "Tailwind CSS",
    "Docker",
    "AWS",
    "Testing",
    "Git",
  ],
  "data scientist": [
    "Python",
    "Pandas",
    "NumPy",
    "scikit-learn",
    "SQL",
    "Statistics",
    "Machine Learning",
    "TensorFlow",
    "Jupyter",
    "Data Visualization",
  ],
  "data analyst": [
    "SQL",
    "Python",
    "Excel",
    "Power BI",
    "Tableau",
    "Statistics",
    "Pandas",
    "Data Storytelling",
    "A/B Testing",
  ],
  "machine learning engineer": [
    "Python",
    "PyTorch",
    "TensorFlow",
    "scikit-learn",
    "MLOps",
    "Docker",
    "Kubernetes",
    "AWS",
    "Data Engineering",
    "SQL",
  ],
  "devops engineer": [
    "Docker",
    "Kubernetes",
    "AWS",
    "Terraform",
    "CI/CD",
    "Linux",
    "Bash",
    "Monitoring",
    "Python",
    "Networking",
  ],
  "mobile developer": ["React Native", "Swift", "Kotlin", "iOS", "Android", "Firebase", "REST APIs", "Git", "Testing"],
  "qa engineer": [
    "Manual Testing",
    "Automation",
    "Selenium",
    "Cypress",
    "Playwright",
    "API Testing",
    "Postman",
    "Bug Tracking",
    "Agile",
  ],
  "cybersecurity analyst": [
    "Networking",
    "Linux",
    "SIEM",
    "Wireshark",
    "Penetration Testing",
    "OWASP",
    "Python",
    "Incident Response",
    "Cryptography",
  ],
  "cloud engineer": [
    "AWS",
    "Azure",
    "GCP",
    "Terraform",
    "Kubernetes",
    "Docker",
    "Linux",
    "CI/CD",
    "Networking",
    "Python",
  ],

  // ---------- Traditional engineering ----------
  "mechanical engineer": [
    "AutoCAD",
    "SolidWorks",
    "MATLAB",
    "Thermodynamics",
    "Fluid Mechanics",
    "Finite Element Analysis",
    "GD&T",
    "Manufacturing",
    "Project Management",
    "Materials Science",
  ],
  "civil engineer": [
    "AutoCAD",
    "Revit",
    "STAAD Pro",
    "Structural Analysis",
    "Project Management",
    "Surveying",
    "Construction Management",
    "Concrete Design",
    "Steel Design",
    "Health & Safety",
  ],
  "electrical engineer": [
    "MATLAB",
    "Simulink",
    "Circuit Design",
    "PCB Design",
    "Power Systems",
    "Embedded Systems",
    "AutoCAD Electrical",
    "Microcontrollers",
    "Control Systems",
    "C/C++",
  ],
  "chemical engineer": [
    "Process Simulation",
    "Aspen Plus",
    "Thermodynamics",
    "Reaction Engineering",
    "Process Safety",
    "MATLAB",
    "HAZOP",
    "Mass Transfer",
    "Lab Skills",
  ],
  "industrial engineer": [
    "Lean Manufacturing",
    "Six Sigma",
    "Operations Research",
    "Supply Chain",
    "Process Improvement",
    "Minitab",
    "AutoCAD",
    "Project Management",
    "Statistics",
  ],
  "biomedical engineer": [
    "MATLAB",
    "Medical Devices",
    "Anatomy",
    "Signal Processing",
    "CAD",
    "Regulatory (FDA)",
    "Lab Skills",
    "Biomaterials",
  ],
  "automotive engineer": [
    "CATIA",
    "SolidWorks",
    "Vehicle Dynamics",
    "CAN Bus",
    "MATLAB",
    "Powertrain",
    "Manufacturing",
    "Project Management",
  ],

  // ---------- Design ----------
  "ui/ux designer": [
    "Figma",
    "Prototyping",
    "User Research",
    "Wireframing",
    "Design Systems",
    "Accessibility",
    "Usability Testing",
    "Visual Design",
  ],
  "graphic designer": [
    "Adobe Illustrator",
    "Adobe Photoshop",
    "Adobe InDesign",
    "Typography",
    "Branding",
    "Layout",
    "Color Theory",
    "Print Design",
  ],
  "motion designer": [
    "After Effects",
    "Cinema 4D",
    "Premiere Pro",
    "Animation Principles",
    "Storyboarding",
    "Illustrator",
    "Figma",
  ],

  // ---------- Product / Business ----------
  "product manager": [
    "Roadmapping",
    "User Research",
    "Analytics",
    "SQL",
    "A/B Testing",
    "Figma",
    "Agile",
    "Stakeholder Management",
    "Prioritization",
  ],
  "project manager": [
    "Agile",
    "Scrum",
    "JIRA",
    "Risk Management",
    "Stakeholder Management",
    "Budgeting",
    "MS Project",
    "Communication",
    "PMP",
  ],
  "business analyst": [
    "SQL",
    "Excel",
    "Power BI",
    "Requirements Gathering",
    "Process Mapping",
    "UML",
    "Stakeholder Management",
    "Tableau",
    "Documentation",
  ],
  "marketing manager": [
    "SEO",
    "Google Analytics",
    "Content Strategy",
    "Email Marketing",
    "Social Media",
    "Copywriting",
    "Paid Ads",
    "HubSpot",
    "Brand Strategy",
  ],
  "digital marketer": [
    "SEO",
    "SEM",
    "Google Ads",
    "Meta Ads",
    "Google Analytics",
    "Email Marketing",
    "Content Marketing",
    "Conversion Optimization",
    "Copywriting",
  ],
  "sales executive": [
    "CRM (Salesforce)",
    "Cold Outreach",
    "Negotiation",
    "Pipeline Management",
    "Lead Generation",
    "Communication",
    "Closing",
    "Account Management",
  ],
  "human resources": [
    "Recruitment",
    "Onboarding",
    "Employee Relations",
    "HRIS",
    "Compensation",
    "Labor Law",
    "Performance Management",
    "Training",
    "Communication",
  ],
  "financial analyst": [
    "Excel",
    "Financial Modeling",
    "Valuation",
    "Accounting",
    "Power BI",
    "SQL",
    "PowerPoint",
    "Forecasting",
    "Bloomberg",
  ],
  accountant: ["Excel", "QuickBooks", "Bookkeeping", "Tax", "IFRS", "Reconciliation", "Audit", "ERP (SAP)"],
  "operations manager": [
    "Process Improvement",
    "KPIs",
    "Budgeting",
    "Lean",
    "Team Leadership",
    "Supply Chain",
    "ERP",
    "Project Management",
  ],
  consultant: [
    "Excel",
    "PowerPoint",
    "Problem Solving",
    "Market Research",
    "Financial Modeling",
    "Storytelling",
    "Stakeholder Management",
    "SQL",
  ],
  entrepreneur: [
    "Business Strategy",
    "Fundraising",
    "Product Market Fit",
    "Marketing",
    "Sales",
    "Finance",
    "Leadership",
    "Storytelling",
  ],

  // ---------- Content & Creative ----------
  "content creator": [
    "Video Editing (Premiere Pro)",
    "Storytelling",
    "Scripting",
    "Adobe Photoshop",
    "Lighting",
    "Audio Editing",
    "SEO",
    "Social Media Strategy",
    "Branding",
    "Analytics",
  ],
  youtuber: [
    "Video Editing",
    "DaVinci Resolve",
    "Thumbnails (Photoshop)",
    "Storytelling",
    "SEO",
    "Audience Growth",
    "Camera Operation",
    "Lighting",
    "Scripting",
  ],
  "social media manager": [
    "Content Strategy",
    "Copywriting",
    "Canva",
    "Analytics",
    "Community Management",
    "Paid Ads",
    "Scheduling Tools",
    "Trend Analysis",
  ],
  copywriter: [
    "Copywriting",
    "SEO",
    "Brand Voice",
    "Storytelling",
    "Editing",
    "Research",
    "CMS (WordPress)",
    "A/B Testing",
  ],
  "video editor": [
    "Premiere Pro",
    "DaVinci Resolve",
    "After Effects",
    "Color Grading",
    "Sound Design",
    "Storytelling",
    "Pacing",
  ],
  photographer: [
    "Lightroom",
    "Photoshop",
    "Composition",
    "Lighting",
    "Camera Operation",
    "Retouching",
    "Color Grading",
  ],

  // ---------- Other careers ----------
  teacher: [
    "Lesson Planning",
    "Classroom Management",
    "Curriculum Design",
    "Assessment",
    "Communication",
    "Educational Technology",
  ],
  nurse: ["Patient Care", "Medical Records", "First Aid", "BLS", "Communication", "Empathy", "Pharmacology"],
  lawyer: ["Legal Research", "Contract Drafting", "Negotiation", "Litigation", "Compliance", "Communication"],
  architect: [
    "AutoCAD",
    "Revit",
    "SketchUp",
    "3ds Max",
    "Rhino",
    "Lumion",
    "Adobe Photoshop",
    "Building Codes",
    "Project Management",
  ],

  // ---------- Transport, aviation, service ----------
  "truck driver": ["CDL", "Route Planning", "Vehicle Inspection", "Safety Compliance", "GPS Navigation"],
  "delivery driver": ["Driving License", "GPS Navigation", "Customer Service", "Time Management"],
  "bus driver": ["Driving License", "Passenger Safety", "Route Knowledge", "First Aid"],
  pilot: ["ATPL", "IFR", "Crew Resource Management", "English Proficiency", "Flight Planning"],
  "flight attendant": ["Customer Service", "Safety Procedures", "First Aid", "Arabic", "English"],
  "call center agent": ["Communication", "CRM", "Active Listening", "English", "Typing Speed", "Patience"],
  "customer service representative": [
    "Communication",
    "Problem Solving",
    "CRM",
    "Arabic",
    "English",
    "Empathy",
  ],
  cashier: ["POS", "Cash Handling", "Customer Service", "Accuracy"],
  waiter: ["Customer Service", "POS", "Teamwork", "Food Safety"],
  chef: ["Food Preparation", "Kitchen Safety", "Menu Planning", "Team Leadership"],
  "security guard": ["Surveillance", "Access Control", "Report Writing", "Physical Fitness"],
  "warehouse worker": ["Forklift", "Inventory", "Safety", "Teamwork"],
  electrician: ["Wiring", "Safety Codes", "Blueprint Reading", "Troubleshooting"],
  plumber: ["Pipefitting", "Installation", "Maintenance", "Safety"],
  "english teacher": ["TESOL", "Lesson Planning", "Communication", "Classroom Management"],
  "bank teller": ["Cash Handling", "Customer Service", "Compliance", "Arabic", "English"],
  "sales representative": ["Sales", "Negotiation", "CRM", "Communication", "Product Knowledge"],
};

async function fetchSkillsFromServer(role: string): Promise<string[]> {
  const key = role.trim().toLowerCase();
  const cached = aiSkillsCache.get(key);
  if (cached) return cached;

  const { skills } = await fetchRoleSkillsAI({ data: { role } });
  aiSkillsCache.set(key, skills);
  return skills;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Exports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Sync — static list only */
export function getRoleSkills(role: string): string[] {
  if (!role) return [];
  const key = role.trim().toLowerCase();
  if (ROLE_SKILLS[key]) return ROLE_SKILLS[key];
  const found = Object.keys(ROLE_SKILLS).find((k) => key.includes(k) || k.includes(key));
  return found ? ROLE_SKILLS[found] : [];
}

/** Async — static first, server AI for unknown roles */
export async function getRoleSkillsAsync(role: string): Promise<string[]> {
  const stat = getRoleSkills(role);
  if (stat.length > 0) return stat;
  return fetchSkillsFromServer(role);
}

/** true if role exists in static list */
export function isKnownRole(role: string): boolean {
  const key = role.trim().toLowerCase();
  return !!ROLE_SKILLS[key] || Object.keys(ROLE_SKILLS).some((k) => key.includes(k) || k.includes(key));
}

export function listRoles(): string[] {
  return Object.keys(ROLE_SKILLS).map((r) => r.replace(/\b\w/g, (c) => c.toUpperCase()));
}

/** Sync skill-gap (known roles only) */
export function analyzeSkillGap(userSkills: string[], targetRole: string) {
  const required = getRoleSkills(targetRole);
  return analyzeSkillGapWithRequired(userSkills, required);
}

/** Async skill-gap — any role via static map or server AI */
export async function analyzeSkillGapAsync(targetRole: string, userSkills: string[]) {
  const required = await getRoleSkillsAsync(targetRole);
  return analyzeSkillGapWithRequired(userSkills, required);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  YouTube mock recommendations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function recommendVideos(skill: string) {
  const queries = [
    { title: `${skill} Crash Course for Beginners`, channel: "freeCodeCamp.org", duration: "1h 24m", views: "2.1M" },
    { title: `Master ${skill} in 30 Days — Roadmap`, channel: "Fireship", duration: "12 min", views: "890K" },
    { title: `${skill}: Build a Real Project`, channel: "Web Dev Simplified", duration: "48 min", views: "412K" },
    { title: `Top 10 ${skill} Mistakes to Avoid`, channel: "Traversy Media", duration: "22 min", views: "320K" },
    { title: `${skill} Interview Questions Explained`, channel: "Tech With Tim", duration: "35 min", views: "510K" },
  ];
  return queries.map((q, i) => ({
    ...q,
    id: `${skill}-${i}`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + " tutorial")}`,
    thumb: `https://picsum.photos/seed/${encodeURIComponent(skill + i)}/320/180`,
  }));
}

export { matchJobs, searchJobs, type Job, type MatchedJob } from "./jobs-search";
