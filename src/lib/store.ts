import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JobCategory } from "./jobs-types";

export type Experience = {
  id: string;
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  field?: string;
  start: string;
  end: string;
  details?: string;
};

export type Project = {
  id: string;
  name: string;
  link?: string;
  description: string;
  tech?: string;
};

export type CV = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  targetRole: string;
  photo?: string;
};

export const emptyCV: CV = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  targetRole: "",
  photo: "",
};

export type CVTemplateId = "classic" | "modern" | "compact";

export type LinkedInState = {
  connected: boolean;
  profileUrl: string;
  slug: string;
  displayName?: string;
  connectedAt: string;
};

export type JobPreferences = {
  location: string;
  category: JobCategory;
  remoteOnly: boolean;
};

type Store = {
  cv: CV;
  templateId: CVTemplateId;
  user: { name: string; email: string } | null;
  linkedin: LinkedInState | null;
  savedJobIds: string[];
  appliedJobIds: string[];
  jobPreferences: JobPreferences;
  setCV: (patch: Partial<CV>) => void;
  setTemplateId: (id: CVTemplateId) => void;
  setUser: (u: Store["user"]) => void;
  setLinkedIn: (l: LinkedInState | null) => void;
  setJobPreferences: (p: Partial<JobPreferences>) => void;
  toggleSavedJob: (id: string) => void;
  markApplied: (id: string) => void;
  logout: () => void;
  reset: () => void;
  loadSample: () => void;
};

const sample: CV = {
  fullName: "Mustafa Mohamed",
  title: "Frontend Engineer",
  email: "mustafa.mohamed@example.com",
  phone: "01100280773",
  location: "Cairo, Egypt",
  website: "Mustafamohamed.dev",
  linkedin: "linkedin.com/in/mustafa-mohamed",
  summary:
    "Frontend engineer with 4+ years building accessible, performant web apps in React and TypeScript. Shipped products used by 200k+ users and led a design system migration that cut UI bug reports by 38%.",
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "PostgreSQL", "Jest", "Figma"],
  experience: [
    {
      id: "e1",
      role: "Senior Frontend Engineer",
      company: "Northwind Labs",
      location: "Remote",
      start: "2023",
      end: "Present",
      bullets: [
        "Led migration of legacy app to React 18 + TypeScript, cutting bundle size by 42%.",
        "Built reusable component library used by 6 product teams.",
        "Mentored 3 junior engineers; ran weekly code review sessions.",
      ],
    },
  ],
  education: [
    {
      id: "ed1",
      school: "Sadat Academy",
      degree: "BSc",
      field: "Business Information Systems",
      start: "2020",
      end: "2024",
      details: "Graduation project: AI career platform.",
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Resume Platform",
      link: "github.com/mustafa/resume",
      description: "ATS-friendly CV builder with AI skill gap and live job search.",
      tech: "React, TanStack Start, Groq",
    },
  ],
  targetRole: "Senior Frontend Engineer",
};

const defaultPrefs: JobPreferences = {
  location: "Egypt",
  category: "all",
  remoteOnly: false,
};

export const useCVStore = create<Store>()(
  persist(
    (set) => ({
      cv: emptyCV,
      templateId: "classic",
      user: null,
      linkedin: null,
      savedJobIds: [],
      appliedJobIds: [],
      jobPreferences: defaultPrefs,
      setCV: (patch) => set((s) => ({ cv: { ...s.cv, ...patch } })),
      setTemplateId: (templateId) => set({ templateId }),
      setUser: (user) => set({ user }),
      setLinkedIn: (linkedin) => set({ linkedin }),
      setJobPreferences: (p) => set((s) => ({ jobPreferences: { ...s.jobPreferences, ...p } })),
      toggleSavedJob: (id) =>
        set((s) => ({
          savedJobIds: s.savedJobIds.includes(id) ? s.savedJobIds.filter((x) => x !== id) : [...s.savedJobIds, id],
        })),
      markApplied: (id) =>
        set((s) => ({
          appliedJobIds: s.appliedJobIds.includes(id) ? s.appliedJobIds : [...s.appliedJobIds, id],
        })),
      logout: () =>
        set({
          user: null,
          linkedin: null,
        }),
      reset: () =>
        set({
          cv: emptyCV,
          templateId: "classic",
          savedJobIds: [],
          appliedJobIds: [],
        }),
      loadSample: () => set({ cv: sample }),
    }),
    { name: "cv-builder-store" }
  )
);
