# Resume — ATS-Friendly CV Builder

Graduation project: build ATS-friendly resumes with AI skill-gap analysis, learning paths, job matching, and an embedded CV coach.

## Features

- **CV Builder** — Step-by-step form with live preview, 3 templates (Classic, Modern, Compact)
- **PDF export** — Download PDF via html2canvas + jsPDF (plus browser Print)
- **ATS score** — AI analysis via Groq on the server, with rule-based fallback when no API key
- **Skill gap** — Static role maps + server AI for custom job titles (no client API keys)
- **100% live job search** — No fake job cards; results from real APIs only
- **LinkedIn jobs** — `RAPIDAPI_KEY` + JSearch (real `linkedin.com` apply links when connected)
- **Egypt jobs** — `CAREERJET_AFFID` (free partner ID from careerjet.com.eg)
- **Account** — Log out, saved jobs, preferences, application tracking
- **CV chat** — Groq-powered assistant with your CV as context

## Tech stack

- React 19, TanStack Start/Router, Vite 7
- Zustand (persisted CV data)
- Tailwind CSS 4, shadcn/ui
- Cloudflare Workers (`src/server.ts`)
- Groq API (`llama-3.1-8b-instant`)

## Setup

```bash
npm install
cp .env.example .env
# Add your Groq key (server-side only):
# GROQ_API_KEY=gsk_xxxx
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Environment variables

| Variable       | Where       | Purpose                             |
| -------------- | ----------- | ----------------------------------- |
| `GROQ_API_KEY` | Server only | ATS, chat, unknown-role skill lists |
| `RAPIDAPI_KEY` | Server only | Live jobs (JSearch — includes LinkedIn apply links) |

Do **not** use `VITE_GROQ_API_KEY` — all AI calls go through server functions.

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Development server       |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | ESLint                   |
| `npm run format`  | Prettier                 |

## Deploy (Cloudflare)

Set `GROQ_API_KEY` in the Cloudflare dashboard for your Worker, then deploy with Wrangler per your hosting setup.

## Project structure

```
src/
  routes/          # Pages: builder, skills, jobs, auth
  components/      # UI, CV templates, ChatBot, ATSScore
  lib/             # Store, AI, ATS, PDF, validation
  server.ts        # Cloudflare entry
```

## Graduation demo flow

1. Sign up / login (demo — data stored locally)
2. Build CV → pick template → Download PDF
3. Run ATS analyze on the builder page
4. Open Skill Gap for target role
5. Browse matched jobs (filter Egypt roles)
6. Use CV Assistant chat for bullet improvements
