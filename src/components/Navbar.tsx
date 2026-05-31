import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { themes, useTheme, applyTheme, type ThemeId } from "@/lib/theme";
import { fonts, useFont, applyFont, type FontId } from "@/lib/font";
import { useCVStore } from "@/lib/store";
import { Palette, Menu, X, Sparkles, Type } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { font, setFont } = useFont();
  const user = useCVStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [fontMenu, setFontMenu] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  useEffect(() => {
    applyFont(font);
  }, [font]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/builder", label: "Builder" },
    { to: "/skills", label: "Skill Gap" },
    { to: "/jobs", label: "Jobs" },
    { to: "/account", label: "Account" },
  ];

  return (
    <header className="sticky top-0 z-50 no-print">
      <div className="mx-auto mt-4 w-[min(1200px,94%)]">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-xl">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>Resume</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  path === l.to ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => {
                  setFontMenu((v) => !v);
                  setPalette(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm hover:bg-secondary"
                aria-label="Font switcher"
              >
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Font</span>
              </button>
              <AnimatePresence>
                {fontMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="glass absolute right-0 top-full mt-2 w-64 rounded-xl p-2 shadow-2xl"
                  >
                    {fonts.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFont(f.id as FontId);
                          setFontMenu(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary ${
                          font === f.id ? "bg-secondary" : ""
                        }`}
                      >
                        <span style={{ fontFamily: f.display }} className="text-base">
                          {f.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Aa</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button
                onClick={() => setPalette((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm hover:bg-secondary"
                aria-label="Theme switcher"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Theme</span>
              </button>
              <AnimatePresence>
                {palette && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="glass absolute right-0 top-full mt-2 w-64 rounded-xl p-2 shadow-2xl"
                  >
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id as ThemeId);
                          setPalette(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary ${
                          theme === t.id ? "bg-secondary" : ""
                        }`}
                      >
                        <span>{t.name}</span>
                        <span className="flex gap-1">
                          {t.swatch.map((c, i) => (
                            <span
                              key={i}
                              className="h-4 w-4 rounded-full border border-border"
                              style={{ background: c }}
                            />
                          ))}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:block">
              {user ? <UserMenu /> : null}
            </div>
            {!user && (
              <Link
                to="/login"
                className="hidden rounded-lg border border-border bg-surface px-3 py-1.5 text-sm hover:bg-secondary md:inline-block"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/builder"
              className="hidden rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 md:inline-block"
            >
              Get started
            </Link>

            <button
              className="rounded-lg border border-border bg-surface p-2 md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass mt-2 overflow-hidden rounded-2xl p-2 md:hidden"
            >
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    useCVStore.getState().logout();
                    setOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                >
                  Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                >
                  Sign in
                </Link>
              )}
              <Link to="/account" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">
                Account
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
