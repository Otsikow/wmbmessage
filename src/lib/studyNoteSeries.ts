// Detect and order numbered study-note series such as
// "THE SEVEN CHURCH AGES - PART 5" (hyphen, en/em dash, or plain spacing).

export interface SeriesRef {
  id: string;
  title: string;
  slug?: string | null;
  topic?: string | null;
}

export interface ParsedSeriesTitle {
  seriesKey: string;
  seriesTitle: string;
  part: number;
}

const PART_RE =
  /^(.*?)[\s]*[-–—:]?[\s]*\bpart\s*(?:no\.?\s*)?(\d{1,3})\b[\s]*[.)]?\s*$/i;

export function normalizeSeriesKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseSeriesTitle(title: string): ParsedSeriesTitle | null {
  if (!title) return null;
  const m = title.replace(/[–—]/g, "-").match(PART_RE);
  if (!m) return null;
  const seriesTitle = m[1].replace(/[\s\-:]+$/, "").trim();
  if (!seriesTitle) return null;
  const part = Number.parseInt(m[2], 10);
  if (!Number.isFinite(part)) return null;
  return { seriesKey: normalizeSeriesKey(seriesTitle), seriesTitle, part };
}

export interface SeriesNavigation<T extends SeriesRef> {
  seriesTitle: string;
  current: number;
  total: number;
  items: Array<T & { part: number; isCurrent: boolean }>;
  previous: (T & { part: number }) | null;
  next: (T & { part: number }) | null;
}

/**
 * Build ordered series navigation for `current` from `all` notes.
 * Returns null when the current note is not part of a numbered series.
 */
export function buildSeriesNavigation<T extends SeriesRef>(
  current: T,
  all: T[],
): SeriesNavigation<T> | null {
  const parsed = parseSeriesTitle(current.title);
  if (!parsed) return null;

  const seen = new Set<string>();
  const members: Array<T & { part: number; isCurrent: boolean }> = [];

  for (const note of [current, ...all]) {
    const p = parseSeriesTitle(note.title);
    if (!p || p.seriesKey !== parsed.seriesKey) continue;
    if (seen.has(note.id)) continue;
    seen.add(note.id);
    members.push({ ...note, part: p.part, isCurrent: note.id === current.id });
  }

  members.sort((a, b) => a.part - b.part || a.title.localeCompare(b.title));

  const idx = members.findIndex((m) => m.isCurrent);
  const previous = idx > 0 ? members[idx - 1] : null;
  const next = idx >= 0 && idx < members.length - 1 ? members[idx + 1] : null;

  return {
    seriesTitle: parsed.seriesTitle,
    current: parsed.part,
    total: members.length,
    items: members,
    previous,
    next,
  };
}

/** Deterministic same-topic recommendations, excluding the current note. */
export function buildTopicRecommendations<T extends SeriesRef>(
  current: T,
  all: T[],
  limit = 4,
): T[] {
  return all
    .filter((n) => n.id !== current.id)
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }))
    .slice(0, limit);
}
