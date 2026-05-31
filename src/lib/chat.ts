// src/lib/chat.ts

import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT = `You are an expert CV and career coach assistant embedded inside an ATS-friendly CV Builder app called "Resume".

You help users with:
1. Writing and improving CV sections (professional summary, experience bullets, skills list, etc.)
2. Analysing their current skills and suggesting what to learn next
3. Finding relevant job opportunities based on their profile and target role
4. Answering questions about the app and how to use it
5. ATS optimisation tips (keywords, formatting, structure)

The user's current CV data is provided to you as context — use it to give personalised, specific advice.
When suggesting CV text, present it clearly so the user can copy-paste it directly.
Respond in the same language the user writes in (Arabic or English).
Keep responses concise, actionable, and friendly. Use bullet points where helpful.`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendChatMessage = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  const messages: { role: string; content: string }[] = ctx?.data?.messages ?? [];
  const cvContext: string = ctx?.data?.cvContext ?? "";

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const groqMessages = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\n[CV CONTEXT]\n${cvContext}`,
    },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: groqMessages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const result = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const text = result.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
  return { reply: text };
});
