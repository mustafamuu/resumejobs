import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeId = "editorial" | "light" | "blue" | "purple" | "sunset";

export const themes: { id: ThemeId; name: string; swatch: string[]; tone: "dark" | "light" }[] = [
  { id: "editorial", name: "Editorial", swatch: ["#1c1d24", "#7adfe9", "#d59cf2"], tone: "dark" },
  { id: "light", name: "Daylight", swatch: ["#ffffff", "#3b3fbf", "#c44ce0"], tone: "light" },
  { id: "blue", name: "Professional", swatch: ["#10182a", "#5b9bff", "#8acdff"], tone: "dark" },
  { id: "purple", name: "Creative", swatch: ["#1a1228", "#c084fc", "#fb923c"], tone: "dark" },
  { id: "sunset", name: "Sunset", swatch: ["#1f160f", "#f59e0b", "#ef4444"], tone: "dark" },
];

type S = { theme: ThemeId; setTheme: (t: ThemeId) => void };

export const useTheme = create<S>()(
  persist(
    (set) => ({
      theme: "editorial",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "cv-theme" }
  )
);

export function applyTheme(t: ThemeId) {
  if (typeof document === "undefined") return;
  const cls = document.documentElement.classList;
  ["theme-editorial", "theme-light", "theme-blue", "theme-purple", "theme-sunset"].forEach((c) => cls.remove(c));
  cls.add(`theme-${t}`);
}
