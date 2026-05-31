import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontId = "editorial" | "modern" | "classic" | "bold" | "playful";

export const fonts: { id: FontId; name: string; display: string; body: string; google: string }[] = [
  {
    id: "editorial",
    name: "Editorial",
    display: '"Instrument Serif", ui-serif, Georgia, serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
    google: "Instrument+Serif:ital@0;1|Inter:wght@300;400;500;600;700",
  },
  {
    id: "modern",
    name: "Modern",
    display: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    body: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    google: "Space+Grotesk:wght@400;500;600;700|Manrope:wght@300;400;500;600;700",
  },
  {
    id: "classic",
    name: "Classic",
    display: '"Playfair Display", ui-serif, Georgia, serif',
    body: '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
    google: "Playfair+Display:wght@400;600;700|Source+Sans+3:wght@300;400;500;600;700",
  },
  {
    id: "bold",
    name: "Bold",
    display: '"DM Serif Display", ui-serif, Georgia, serif',
    body: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
    google: "DM+Serif+Display|IBM+Plex+Sans:wght@300;400;500;600;700",
  },
  {
    id: "playful",
    name: "Playful",
    display: '"Fraunces", ui-serif, Georgia, serif',
    body: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    google: "Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700|Plus+Jakarta+Sans:wght@300;400;500;600;700",
  },
];

type S = { font: FontId; setFont: (f: FontId) => void };

export const useFont = create<S>()(
  persist((set) => ({ font: "editorial", setFont: (font) => set({ font }) }), { name: "cv-font" })
);

const LINK_ID = "resu-fonts-link";

export function applyFont(id: FontId) {
  if (typeof document === "undefined") return;
  const f = fonts.find((x) => x.id === id) ?? fonts[0];

  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  const families = f.google
    .split("|")
    .map((g) => `family=${g}`)
    .join("&");
  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  if (!link) {
    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;

  const root = document.documentElement;
  root.style.setProperty("--font-display", f.display);
  root.style.setProperty("--font-sans", f.body);
}
