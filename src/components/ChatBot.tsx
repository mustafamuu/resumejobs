// src/components/ChatBot.tsx

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, Trash2, ChevronDown } from "lucide-react";
import { useCVStore } from "@/lib/store";
import { sendChatMessage } from "@/lib/chat";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const QUICK_PROMPTS = [
  {
    label: "✍️ Improve my summary",
    value: "Please improve my professional summary to make it more impactful and ATS-friendly.",
  },
  { label: "🎯 Skills for my role", value: "What skills should I add based on my target role and current experience?" },
  {
    label: "💼 Review my bullets",
    value: "Review my experience bullet points and suggest improvements using the STAR method.",
  },
  { label: "🔍 Find jobs for me", value: "Based on my CV, what job titles and companies should I target?" },
  { label: "📊 ATS tips", value: "Give me specific ATS optimization tips for my CV." },
  { label: "🚀 Quick wins", value: "What are the 3 most impactful changes I can make to my CV right now?" },
];

function buildCvContext(cv: ReturnType<typeof useCVStore.getState>["cv"]): string {
  const expList = cv.experience
    .map((e) => `  • ${e.role} at ${e.company} (${e.start}–${e.end})\n    ${e.bullets.filter(Boolean).join(" | ")}`)
    .join("\n");
  const eduList = cv.education
    .map((e) => `  • ${e.degree} ${e.field ? `in ${e.field}` : ""} — ${e.school} (${e.start}–${e.end})`)
    .join("\n");
  const projList = cv.projects.map((p) => `  • ${p.name}${p.tech ? ` (${p.tech})` : ""}: ${p.description}`).join("\n");

  return [
    `Name: ${cv.fullName || "Not set"}`,
    `Current title: ${cv.title || "Not set"}`,
    `Target role: ${cv.targetRole || "Not set"}`,
    `Location: ${cv.location || "Not set"}`,
    `Email: ${cv.email || "Not set"}`,
    `LinkedIn: ${cv.linkedin || "Not set"}`,
    `Skills: ${cv.skills.length ? cv.skills.join(", ") : "None added yet"}`,
    `Summary: ${cv.summary || "Not written yet"}`,
    `Experience (${cv.experience.length}):\n${expList || "  None"}`,
    `Education (${cv.education.length}):\n${eduList || "  None"}`,
    `Projects (${cv.projects.length}):\n${projList || "  None"}`,
  ].join("\n");
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Render markdown-like bold (**text**) simply
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      timestamp: new Date(),
      content:
        "👋 Hi! I'm your AI CV assistant.\n\nI can help you:\n• ✍️ Write & improve your CV sections\n• 🎯 Analyse your skills gap\n• 🔍 Find matching jobs\n• 📊 Optimise for ATS\n\nWhat would you like to work on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cv = useCVStore((s) => s.cv);

  const chatMutation = useMutation({
    mutationFn: (payload: { messages: { role: string; content: string }[]; cvContext: string }) =>
      sendChatMessage({ data: payload }),
  });

  const loading = chatMutation.isPending;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 250);
      setUnread(0);
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Count unread when closed
      setUnread((u) => u + 1);
    }
  }, [messages]);

  // Show scroll-to-bottom button when scrolled up
  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages.filter((m) => m.id !== "welcome"), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const { reply } = await chatMutation.mutateAsync({
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        cvContext: buildCvContext(cv),
      });

      setMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: reply, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again in a moment. 🔄",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        timestamp: new Date(),
        content:
          "👋 Hi! I'm your AI CV assistant.\n\nI can help you:\n• ✍️ Write & improve your CV sections\n• 🎯 Analyse your skills gap\n• 🔍 Find matching jobs\n• 📊 Optimise for ATS\n\nWhat would you like to work on?",
      },
    ]);
  };

  const isFirst = messages.length === 1 && messages[0].id === "welcome";
  const hasUnread = !open && unread > 1;

  return (
    <>
      {/* ── Floating toggle button ── */}
      <motion.button
        onClick={() => {
          setOpen((o) => !o);
          setUnread(0);
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 no-print"
        aria-label={open ? "Close CV assistant" : "Open CV assistant"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 flex w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl no-print"
            style={{ height: "520px", maxHeight: "calc(100vh - 120px)" }}
          >
            {/* ── Header ── */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">CV Assistant</div>
                <div className="text-xs text-muted-foreground">Always ready</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              ref={messagesRef}
              onScroll={handleScroll}
              className="px-4 py-4"
              style={{
                flex: "1 1 0",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                minHeight: 0,
              }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: idx === messages.length - 1 ? 0 : 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className="flex max-w-[84%] flex-col gap-1">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "rounded-tr-sm bg-primary text-primary-foreground"
                          : "rounded-tl-sm bg-secondary text-foreground"
                      }`}
                    >
                      <MessageContent content={msg.content} />
                    </div>
                    <span
                      className={`text-[10px] text-muted-foreground ${msg.role === "user" ? "text-right" : "text-left"}`}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-24 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-md text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ── Quick prompts ── */}
            {isFirst && (
              <div className="shrink-0 border-t border-border px-4 py-2.5">
                <div className="mb-2 text-xs font-medium text-muted-foreground">Quick prompts</div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => send(p.value)}
                      className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Input ── */}
            <div className="shrink-0 border-t border-border bg-surface px-3 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-input/60 px-3 py-2 transition-colors focus-within:border-primary focus-within:bg-input/80">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask me anything about your CV…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  disabled={loading}
                />
                <motion.button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                  aria-label="Send"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </motion.button>
              </div>
              <div className="mt-1.5 text-center text-[10px] text-muted-foreground">Press Enter to send</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
