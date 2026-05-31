import { createServerFn } from "@tanstack/react-start";
import { analyzeATSLocal } from "./ats-local";

export interface ATSBreakdownItem {
  category: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "error";
  feedback: string;
}

export interface ATSResult {
  score: number;
  breakdown: ATSBreakdownItem[];
  missingKeywords: string[];
  suggestions: string[];
  source?: "ai" | "local";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const analyzeATS = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  const cv = ctx?.data?.cv ?? {};
  const targetRole: string = ctx?.data?.targetRole ?? "General";

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { ...analyzeATSLocal(cv, targetRole), source: "local" as const };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an ATS expert. Respond ONLY with valid JSON. No markdown, no explanation.
Return this exact structure:
{
  "score": <0-100>,
  "breakdown": [
    { "category": "string", "score": number, "maxScore": number, "status": "good|warning|error", "feedback": "string" }
  ],
  "missingKeywords": ["string"],
  "suggestions": ["string"]
}
Categories to evaluate: Contact Info, Summary, Experience, Education, Skills, Keywords, Formatting.`,
          },
          {
            role: "user",
            content: `Analyze this CV for the role of "${targetRole}": ${JSON.stringify(cv)}`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`Groq API error ${response.status}`);
    const result = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = result.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as ATSResult;
    return { ...parsed, source: "ai" as const };
  } catch (err) {
    console.error("[analyzeATS] AI failed, using local rules:", err);
    return { ...analyzeATSLocal(cv, targetRole), source: "local" as const };
  }
});
