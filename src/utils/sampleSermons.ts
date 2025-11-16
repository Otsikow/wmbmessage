export interface SampleSermonRecord {
  title: string;
  date?: string;
  location?: string;
  paragraphs: string[];
  themes?: string[];
  references?: string[];
}

let cachedSampleSermons: SampleSermonRecord[] | null = null;

export async function loadSampleSermons(): Promise<SampleSermonRecord[]> {
  if (cachedSampleSermons) {
    return cachedSampleSermons;
  }

  try {
    const response = await fetch("/sample-data/sermons-sample.json");
    if (!response.ok) {
      throw new Error("Failed to load sample sermons");
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Sample sermons malformed");
    }

    cachedSampleSermons = data
      .map(normalizeSampleSermonRecord)
      .filter((record): record is SampleSermonRecord => record !== null);
  } catch (err) {
    console.warn("Unable to load sample sermons:", err);
    cachedSampleSermons = [];
  }

  return cachedSampleSermons;
}

function normalizeSampleSermonRecord(value: unknown): SampleSermonRecord | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title : null;
  if (!title) {
    return null;
  }

  const date = typeof record.date === "string" ? record.date : undefined;
  const location = typeof record.location === "string" ? record.location : undefined;
  const paragraphs = Array.isArray(record.paragraphs)
    ? record.paragraphs.filter(
        (paragraph): paragraph is string =>
          typeof paragraph === "string" && paragraph.trim().length > 0,
      )
    : [];

  const themes = Array.isArray(record.themes)
    ? record.themes.filter(
        (theme): theme is string => typeof theme === "string" && theme.trim().length > 0,
      )
    : undefined;

  const references = Array.isArray(record.references)
    ? record.references.filter(
        (reference): reference is string =>
          typeof reference === "string" && reference.trim().length > 0,
      )
    : undefined;

  return {
    title,
    date,
    location,
    paragraphs,
    themes,
    references,
  };
}

export function formatSermonDate(date: string | null | undefined): string {
  if (!date) return "Unknown Date";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown Date";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ensureSampleSermonDate(date: string | undefined, fallbackIndex = 0): string {
  if (date) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      return date;
    }
  }

  const fallbackDate = new Date(1960, 0, 1 + (fallbackIndex % 365));
  return fallbackDate.toISOString().split("T")[0];
}
