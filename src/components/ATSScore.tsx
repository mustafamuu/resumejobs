import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { analyzeATS, type ATSResult, type ATSBreakdownItem } from "@/lib/ats";
import { ShieldCheck, AlertTriangle, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  cvData: Record<string, unknown>;
  targetRole?: string;
}

const getScoreStroke = (s: number) => (s >= 75 ? "#34d399" : s >= 50 ? "#fbbf24" : "#f87171");

const getStatusColor = (status: ATSBreakdownItem["status"]) =>
  status === "good" ? "#34d399" : status === "warning" ? "#fbbf24" : "#f87171";

function getScoreLabel(score: number) {
  if (score >= 80) return { text: "Excellent — ATS ready", Icon: ShieldCheck, color: "text-emerald-400" };
  if (score >= 65) return { text: "Good — minor fixes needed", Icon: ShieldCheck, color: "text-emerald-400" };
  if (score >= 50) return { text: "Fair — needs improvement", Icon: AlertTriangle, color: "text-amber-400" };
  return { text: "At risk — likely rejected by ATS", Icon: XCircle, color: "text-red-400" };
}

export function ATSScore({ cvData, targetRole }: Props) {
  const [expanded, setExpanded] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      analyzeATS({
        data: {
          cv: cvData,
          targetRole: targetRole || "General",
        },
      }),
    onSuccess: () => setExpanded(true),
  });

  const result = mutation.data as ATSResult | undefined;
  const label = result ? getScoreLabel(result.score) : null;

  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="mb-0.5 text-xs uppercase tracking-widest text-primary">ATS Score</div>
          <div className="text-sm font-medium text-foreground">CV Compatibility Check</div>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Details
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" /> {result ? "Re-analyze" : "Analyze"}
              </>
            )}
          </button>
        </div>
      </div>

      {result?.source === "local" && (
        <p className="mx-4 mb-2 text-[10px] text-muted-foreground">
          Rule-based analysis (add GROQ_API_KEY on server for AI-powered scoring).
        </p>
      )}

      {mutation.error && (
        <div className="mx-4 mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {mutation.error instanceof Error ? mutation.error.message : "Something went wrong."}
        </div>
      )}

      {result && label && (
        <div className="flex items-center gap-4 border-t border-border px-4 py-3">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <svg viewBox="0 0 36 36" className="absolute h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={getScoreStroke(result.score)}
                strokeWidth="3"
                strokeDasharray={`${result.score} 100`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.8s ease" }}
              />
            </svg>
            <span className={`text-lg font-bold ${label.color}`}>{result.score}</span>
          </div>
          <div>
            <div className={`flex items-center gap-1.5 text-sm font-medium ${label.color}`}>
              <label.Icon className="h-4 w-4" />
              {label.text}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              out of 100 · {result.breakdown.filter((b) => b.status === "good").length} of {result.breakdown.length}{" "}
              categories passed
            </div>
          </div>
        </div>
      )}

      {result && expanded && (
        <div className="space-y-5 border-t border-border p-4">
          <div className="space-y-3">
            {result.breakdown.map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                  <span className="text-xs font-medium tabular-nums" style={{ color: getStatusColor(item.status) }}>
                    {item.score}/{item.maxScore}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(item.score / item.maxScore) * 100}%`,
                      background: getStatusColor(item.status),
                    }}
                  />
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{item.feedback}</p>
              </div>
            ))}
          </div>

          {result.missingKeywords.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-medium text-foreground">Missing keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-md border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-400"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-medium text-foreground">Quick wins</div>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-[11px] text-muted-foreground">
                    <span className="mt-0.5 shrink-0 text-primary">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
