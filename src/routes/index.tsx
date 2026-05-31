import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
  Briefcase,
  Youtube,
  Linkedin,
  Zap,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />

        {/* خفيف جدًا (Glow بسيط بدون لاغ) */}
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        />

        <div className="relative mx-auto w-[min(1200px,94%)] pt-20 pb-24 md:pt-28 md:pb-32">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              Live jobs · LinkedIn · All careers · v2.0
            </motion.div>

            {/* NAME FIX */}
            <motion.h1 variants={fadeUp} className="text-balance text-5xl leading-[1.05] md:text-7xl">
              Build Your <span className="text-gradient italic">Career</span>
              <br className="hidden md:block" />
              <span className="font-display italic text-primary">Resume System</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Build an ATS-ready CV, close skill gaps with AI, and find real roles — from software engineer to driver,
              pilot, or call center — with LinkedIn-powered live search.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/builder"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground glow-primary hover:opacity-90"
              >
                Start building free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 font-medium backdrop-blur hover:bg-secondary"
              >
                Search jobs
              </Link>
              <Link
                to="/skills"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 font-medium backdrop-blur hover:bg-secondary"
              >
                AI skill gap
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> ATS-tested templates
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Free forever
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No credit card
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="relative mx-auto w-[min(1200px,94%)] py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs uppercase tracking-widest text-primary">About me</div>

            <h2 className="mt-3 text-4xl md:text-5xl">
              A career toolkit, <span className="italic text-gradient">not just a builder.</span>
            </h2>

            <p className="mt-5 text-muted-foreground">
              Resume is a free AI career system that helps you build, optimize, and upgrade your CV.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              {[
                "ATS CV builder + 3 templates + PDF export",
                "AI skill gap for any job title",
                "Live job search + LinkedIn connect",
                "15 career categories (tech to driver to pilot)",
                "Save jobs · Log out · Account dashboard",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { k: "60+", v: "Job roles" },
              { k: "15", v: "Industries" },
              { k: "Live", v: "Job API" },
              { k: "100%", v: "ATS ready" },
            ].map((s) => (
              <div key={s.k} className="glass rounded-2xl p-6 text-center">
                <div className="font-display text-5xl text-gradient">{s.k}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto w-[min(1200px,94%)] py-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl">
            Built for <span className="italic text-gradient">every graduate</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">

          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileText, title: "CV Studio", text: "Templates, PDF, ATS score, AI coach." },
            { icon: Target, title: "Skill Gap AI", text: "Any role — known or custom via Groq." },
            { icon: Linkedin, title: "LinkedIn Jobs", text: "Connect profile + live listings." },
            { icon: Briefcase, title: "Smart Search", text: "Category filters + match %." },
            { icon: ShieldCheck, title: "ATS Check", text: "AI + rule-based fallback." },
            { icon: Youtube, title: "Learn", text: "YouTube paths per skill." },
            { icon: Zap, title: "Fast UX", text: "Themes, fonts, mobile-ready." },
            { icon: Sparkles, title: "Account", text: "Logout, saved jobs, preferences." },
          ].map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-5 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <f.icon className="mb-3 h-5 w-5 text-primary" />
              <div className="font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
