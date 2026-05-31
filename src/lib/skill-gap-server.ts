import { createServerFn } from "@tanstack/react-start";

const FALLBACK = [
  "Communication",
  "Problem Solving",
  "Teamwork",
  "Critical Thinking",
  "Time Management",
  "Adaptability",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchRoleSkillsAI = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  const role: string = ctx?.data?.role ?? "";
  if (!role.trim()) return { skills: [] as string[], source: "empty" as const };

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { skills: FALLBACK, source: "fallback" as const };
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              "You are a career advisor. When given a job title, respond with ONLY a JSON array of 8-12 key skills required for that role. No explanation, no markdown, just the raw JSON array.",
          },
          {
            role: "user",
            content: `What are the most important skills for a "${role}"? Reply with only a JSON array.`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Groq error: ${res.status}`);
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "[]";
    const clean = text.replace(/```json|```/gi, "").trim();
    const skills: string[] = JSON.parse(clean);
    if (!Array.isArray(skills) || skills.length === 0) throw new Error("Empty");
    return { skills, source: "ai" as const };
  } catch (err) {
    console.error("[skill-gap-server]", err);
    return { skills: FALLBACK, source: "fallback" as const };
  }
});
