// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Skill Gap Analysis + YouTube Recommendations + Job Matching
//  ✅ Static roles  →  instant response
//  🤖 Unknown roles →  Groq API (llama-3.1-8b-instant) auto-fetch
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── 1. Put your Groq API key here ────────────────────────
const GROQ_API_KEY = import.meta.env._GROQ_API_KEY ?? "";
//   In your .env file add:  _GROQ_API_KEY=gsk_xxxxxxxxxxxx
// ─────────────────────────────────────────────────────────

// ── 2. In-memory cache so we don't call Groq twice for the same role
const aiSkillsCache = new Map<string, string[]>();

// ── 3. Static role → skills map ──────────────────────────
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
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🤖  Groq AI fallback — fetches skills for any unknown role
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function fetchSkillsFromGroq(role: string): Promise<string[]> {
  // Return from cache if already fetched
  const cached = aiSkillsCache.get(role.toLowerCase());
  if (cached) return cached;

  // No API key configured — return sensible generic defaults
  if (!GROQ_API_KEY) {
    const fallback = [
      "Communication",
      "Problem Solving",
      "Teamwork",
      "Critical Thinking",
      "Time Management",
      "Adaptability",
    ];
    aiSkillsCache.set(role.toLowerCase(), fallback);
    return fallback;
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              'You are a career advisor. When given a job title, respond with ONLY a JSON array of 8–12 key skills required for that role. No explanation, no markdown, just the raw JSON array. Example: ["Skill A", "Skill B", "Skill C"]',
          },
          {
            role: "user",
            content: `What are the most important skills for a "${role}"? Reply with only a JSON array.`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "[]";

    // Strip any accidental markdown code fences
    const clean = text.replace(/```json|```/gi, "").trim();
    const skills: string[] = JSON.parse(clean);

    if (!Array.isArray(skills) || skills.length === 0) throw new Error("Empty skills array");

    aiSkillsCache.set(role.toLowerCase(), skills);
    return skills;
  } catch (err) {
    console.error("[skillsUtils] Groq fetch failed:", err);
    const fallback = [
      "Communication",
      "Problem Solving",
      "Teamwork",
      "Critical Thinking",
      "Time Management",
      "Adaptability",
    ];
    aiSkillsCache.set(role.toLowerCase(), fallback);
    return fallback;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Public API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Sync lookup — returns static skills or empty array if unknown */
export function getRoleSkills(role: string): string[] {
  if (!role) return [];
  const key = role.trim().toLowerCase();
  if (ROLE_SKILLS[key]) return ROLE_SKILLS[key];
  const found = Object.keys(ROLE_SKILLS).find((k) => key.includes(k) || k.includes(key));
  return found ? ROLE_SKILLS[found] : [];
}

/**
 * Async lookup — tries static first, then falls back to Groq AI.
 * Always returns a non-empty array.
 */
export async function getRoleSkillsAsync(role: string): Promise<string[]> {
  const static_ = getRoleSkills(role);
  if (static_.length > 0) return static_;
  return fetchSkillsFromGroq(role);
}

/** Whether this role is in our static list */
export function isKnownRole(role: string): boolean {
  const key = role.trim().toLowerCase();
  return !!ROLE_SKILLS[key] || Object.keys(ROLE_SKILLS).some((k) => key.includes(k) || k.includes(key));
}

export function listRoles(): string[] {
  return Object.keys(ROLE_SKILLS).map((r) => r.replace(/\b\w/g, (c) => c.toUpperCase()));
}

/** Sync skill-gap analysis (for known roles only) */
export function analyzeSkillGap(userSkills: string[], targetRole: string) {
  const required = getRoleSkills(targetRole);
  const norm = (s: string) => s.trim().toLowerCase();
  const have = new Set(userSkills.map(norm));
  const matched = required.filter((r) => have.has(norm(r)));
  const missing = required.filter((r) => !have.has(norm(r)));
  const score = required.length === 0 ? 0 : Math.round((matched.length / required.length) * 100);
  return { required, matched, missing, score };
}

/**
 * Async skill-gap analysis — works for ANY role (Groq fallback for unknowns).
 * Use this in your SkillGap page component.
 */
export async function analyzeSkillGapAsync(userSkills: string[], targetRole: string) {
  const required = await getRoleSkillsAsync(targetRole);
  const norm = (s: string) => s.trim().toLowerCase();
  const have = new Set(userSkills.map(norm));
  const matched = required.filter((r) => have.has(norm(r)));
  const missing = required.filter((r) => !have.has(norm(r)));
  const score = required.length === 0 ? 0 : Math.round((matched.length / required.length) * 100);
  return { required, matched, missing, score };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  YouTube mock recommendations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Job pool + matching
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const JOB_POOL = [
  // Tech
  {
    company: "Stripe",
    logo: "S",
    role: "Frontend Engineer",
    location: "Remote (EU)",
    salary: "€85–120k",
    tags: ["React", "TypeScript", "Next.js", "Performance"],
    type: "Full-time",
  },
  {
    company: "Linear",
    logo: "L",
    role: "Senior Frontend Engineer",
    location: "Remote",
    salary: "$140–180k",
    tags: ["React", "TypeScript", "GraphQL", "System Design"],
    type: "Full-time",
  },
  {
    company: "Vercel",
    logo: "V",
    role: "Full Stack Engineer",
    location: "Berlin",
    salary: "€95–130k",
    tags: ["Next.js", "Node.js", "TypeScript", "Edge"],
    type: "Full-time",
  },
  {
    company: "Datadog",
    logo: "D",
    role: "Backend Engineer",
    location: "Paris",
    salary: "€80–110k",
    tags: ["Node.js", "PostgreSQL", "AWS", "Docker"],
    type: "Full-time",
  },
  {
    company: "Shopify",
    logo: "Sh",
    role: "Senior Frontend Engineer",
    location: "Remote",
    salary: "$150–190k",
    tags: ["React", "TypeScript", "Performance", "Accessibility"],
    type: "Full-time",
  },
  {
    company: "Spotify",
    logo: "Sp",
    role: "Data Scientist",
    location: "Stockholm",
    salary: "€75–105k",
    tags: ["Python", "SQL", "Machine Learning", "A/B Testing"],
    type: "Full-time",
  },
  {
    company: "Airbnb",
    logo: "A",
    role: "Full Stack Engineer",
    location: "Remote",
    salary: "$140–180k",
    tags: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    type: "Full-time",
  },
  {
    company: "GitHub",
    logo: "G",
    role: "DevOps Engineer",
    location: "Remote",
    salary: "$130–170k",
    tags: ["Docker", "Kubernetes", "AWS", "Terraform"],
    type: "Full-time",
  },
  {
    company: "Cloudflare",
    logo: "C",
    role: "Cloud Engineer",
    location: "Lisbon",
    salary: "€70–100k",
    tags: ["AWS", "Terraform", "Kubernetes", "Linux"],
    type: "Full-time",
  },
  {
    company: "OpenAI",
    logo: "O",
    role: "Machine Learning Engineer",
    location: "San Francisco",
    salary: "$200–280k",
    tags: ["Python", "PyTorch", "MLOps", "AWS"],
    type: "Full-time",
  },

  // Engineering (non-software)
  {
    company: "Siemens",
    logo: "Si",
    role: "Mechanical Engineer",
    location: "Munich",
    salary: "€55–75k",
    tags: ["SolidWorks", "AutoCAD", "Thermodynamics", "Manufacturing"],
    type: "Full-time",
  },
  {
    company: "Bechtel",
    logo: "B",
    role: "Civil Engineer",
    location: "Dubai",
    salary: "$60–85k",
    tags: ["AutoCAD", "Revit", "Structural Analysis", "Project Management"],
    type: "Full-time",
  },
  {
    company: "Tesla",
    logo: "T",
    role: "Electrical Engineer",
    location: "Berlin",
    salary: "€70–95k",
    tags: ["Circuit Design", "PCB Design", "MATLAB", "Power Systems"],
    type: "Full-time",
  },
  {
    company: "BASF",
    logo: "Ba",
    role: "Chemical Engineer",
    location: "Ludwigshafen",
    salary: "€60–85k",
    tags: ["Aspen Plus", "Process Safety", "Thermodynamics", "HAZOP"],
    type: "Full-time",
  },
  {
    company: "Toyota",
    logo: "Ty",
    role: "Automotive Engineer",
    location: "Nagoya",
    salary: "¥6–9M",
    tags: ["CATIA", "Vehicle Dynamics", "MATLAB", "Powertrain"],
    type: "Full-time",
  },
  {
    company: "Foster + Partners",
    logo: "F+",
    role: "Architect",
    location: "London",
    salary: "£45–65k",
    tags: ["Revit", "Rhino", "AutoCAD", "Lumion"],
    type: "Full-time",
  },

  // Design
  {
    company: "Figma",
    logo: "F",
    role: "Product Designer",
    location: "London",
    salary: "£70–95k",
    tags: ["Figma", "Design Systems", "Prototyping", "User Research"],
    type: "Full-time",
  },
  {
    company: "Pentagram",
    logo: "Pe",
    role: "Graphic Designer",
    location: "New York",
    salary: "$70–95k",
    tags: ["Adobe Illustrator", "Adobe Photoshop", "Typography", "Branding"],
    type: "Full-time",
  },

  // Business / Product / Marketing
  {
    company: "Notion",
    logo: "N",
    role: "Product Manager",
    location: "New York",
    salary: "$160–210k",
    tags: ["Roadmapping", "Analytics", "User Research", "SQL"],
    type: "Full-time",
  },
  {
    company: "McKinsey",
    logo: "Mk",
    role: "Business Analyst",
    location: "London",
    salary: "£55–80k",
    tags: ["Excel", "PowerPoint", "SQL", "Problem Solving"],
    type: "Full-time",
  },
  {
    company: "HubSpot",
    logo: "Hs",
    role: "Marketing Manager",
    location: "Dublin",
    salary: "€65–90k",
    tags: ["SEO", "Google Analytics", "Content Strategy", "HubSpot"],
    type: "Full-time",
  },
  {
    company: "Salesforce",
    logo: "Sf",
    role: "Sales Executive",
    location: "Remote",
    salary: "$90–140k OTE",
    tags: ["CRM (Salesforce)", "Cold Outreach", "Negotiation", "Pipeline Management"],
    type: "Full-time",
  },
  {
    company: "Goldman Sachs",
    logo: "GS",
    role: "Financial Analyst",
    location: "London",
    salary: "£60–85k",
    tags: ["Excel", "Financial Modeling", "Valuation", "PowerPoint"],
    type: "Full-time",
  },
  {
    company: "Deloitte",
    logo: "De",
    role: "Consultant",
    location: "Madrid",
    salary: "€45–65k",
    tags: ["Excel", "PowerPoint", "Problem Solving", "Market Research"],
    type: "Full-time",
  },
  {
    company: "Unilever",
    logo: "U",
    role: "Operations Manager",
    location: "Rotterdam",
    salary: "€70–95k",
    tags: ["Process Improvement", "KPIs", "Lean", "ERP"],
    type: "Full-time",
  },
  {
    company: "PwC",
    logo: "Pw",
    role: "Human Resources Specialist",
    location: "Berlin",
    salary: "€50–70k",
    tags: ["Recruitment", "Onboarding", "HRIS", "Communication"],
    type: "Full-time",
  },

  // Content & Creative
  {
    company: "MrBeast Studios",
    logo: "MB",
    role: "Content Creator",
    location: "Remote",
    salary: "$60–110k",
    tags: ["Video Editing (Premiere Pro)", "Storytelling", "Social Media Strategy", "Branding"],
    type: "Full-time",
  },
  {
    company: "Buffer",
    logo: "Bf",
    role: "Social Media Manager",
    location: "Remote",
    salary: "$60–85k",
    tags: ["Content Strategy", "Copywriting", "Canva", "Analytics"],
    type: "Full-time",
  },
  {
    company: "Netflix",
    logo: "Nf",
    role: "Video Editor",
    location: "Los Angeles",
    salary: "$80–120k",
    tags: ["Premiere Pro", "DaVinci Resolve", "Color Grading", "Storytelling"],
    type: "Full-time",
  },
  {
    company: "Medium",
    logo: "Md",
    role: "Copywriter",
    location: "Remote",
    salary: "$55–85k",
    tags: ["Copywriting", "SEO", "Editing", "Brand Voice"],
    type: "Full-time",
  },
];

export type Job = (typeof JOB_POOL)[number] & {
  id: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
};

export function matchJobs(userSkills: string[], targetRole: string): Job[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const have = new Set(userSkills.map(norm));
  const role = targetRole.trim().toLowerCase();

  return JOB_POOL.map((j, i) => {
    const matched = j.tags.filter((t) => have.has(norm(t)));
    const missing = j.tags.filter((t) => !have.has(norm(t)));
    let score = j.tags.length === 0 ? 50 : Math.round((matched.length / j.tags.length) * 100);
    if (role && j.role.toLowerCase().includes(role)) score = Math.min(100, score + 10);
    return { ...j, id: `${j.company}-${i}`, matchScore: score, matchedSkills: matched, missingSkills: missing };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
