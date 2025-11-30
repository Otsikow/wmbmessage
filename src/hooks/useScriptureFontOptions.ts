import { useMemo } from "react";

export type ScriptureFontId =
  | "gentium"
  | "eb-garamond"
  | "source-serif"
  | "atkinson"
  | "source-sans"
  | "mono-study";

export interface ScriptureFontOption {
  id: ScriptureFontId;
  label: string;
  description: string;
  stack: string;
  preview: string;
}

const SCRIPTURE_FONT_OPTIONS: ScriptureFontOption[] = [
  {
    id: "gentium",
    label: "Gentium Book",
    description: "Scholarly serif designed for readability",
    stack: "'Gentium Book Plus', 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif",
    preview: "In the beginning God created the heaven and the earth.",
  },
  {
    id: "eb-garamond",
    label: "EB Garamond",
    description: "Elegant old-style serif for immersive reading",
    stack: "'EB Garamond', 'Garamond', 'Palatino Linotype', serif",
    preview: "Trust in the Lord with all thine heart.",
  },
  {
    id: "source-serif",
    label: "Source Serif",
    description: "Clean serif with modern proportions",
    stack: "'Source Serif 4', 'Merriweather', Georgia, serif",
    preview: "Thy word is a lamp unto my feet.",
  },
  {
    id: "atkinson",
    label: "Atkinson Hyperlegible",
    description: "Accessible sans for high legibility",
    stack: "'Atkinson Hyperlegible', 'Inter', 'Segoe UI', system-ui, sans-serif",
    preview: "The Lord is my shepherd; I shall not want.",
  },
  {
    id: "source-sans",
    label: "Source Sans",
    description: "Neutral sans serif great for screens",
    stack: "'Source Sans 3', 'Inter', 'Segoe UI', system-ui, sans-serif",
    preview: "Let us hold fast the profession of our faith.",
  },
  {
    id: "mono-study",
    label: "Study Mono",
    description: "Monospaced option for study notes",
    stack: "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Courier New', monospace",
    preview: "All scripture is given by inspiration of God.",
  },
];

export const SCRIPTURE_FONT_STACKS: Record<ScriptureFontId, string> =
  SCRIPTURE_FONT_OPTIONS.reduce(
    (acc, option) => ({ ...acc, [option.id]: option.stack }),
    {} as Record<ScriptureFontId, string>
  );

export const DEFAULT_SCRIPTURE_FONT: ScriptureFontId = "gentium";

export const normalizeScriptureFont = (value: string | null | undefined): ScriptureFontId => {
  if (!value) return DEFAULT_SCRIPTURE_FONT;

  if ((SCRIPTURE_FONT_STACKS as Record<string, string>)[value]) {
    return value as ScriptureFontId;
  }

  if (value === "serif") return "gentium";
  if (value === "sans-serif") return "source-sans";
  if (value === "monospace") return "mono-study";

  return DEFAULT_SCRIPTURE_FONT;
};

export function useScriptureFontOptions() {
  return useMemo(() => SCRIPTURE_FONT_OPTIONS, []);
}
