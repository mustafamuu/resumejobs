import { z } from "zod";
import type { CV } from "./store";

export const personalStepSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  title: z.string().min(2, "Job title is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Phone number is required"),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  targetRole: z.string().optional(),
});

export const summaryStepSchema = z.object({
  summary: z.string().min(40, "Summary should be at least 40 characters"),
});

export function validateBuilderStep(step: number, cv: CV): { ok: true } | { ok: false; errors: string[] } {
  if (step === 0) {
    const r = personalStepSchema.safeParse(cv);
    if (!r.success) return { ok: false, errors: r.error.errors.map((e) => e.message) };
  }
  if (step === 1) {
    const r = summaryStepSchema.safeParse(cv);
    if (!r.success) return { ok: false, errors: r.error.errors.map((e) => e.message) };
  }
  return { ok: true };
}
