import { themeLibrary, type ThemeLibraryEntry } from "@/data/themeLibrary";

export interface ThemeSearchResult extends ThemeLibraryEntry {
  matchScore: number;
  matchedKeywords: string[];
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightQuery(text: string, query: string): (string | { highlight: string })[] {
  if (!query.trim()) {
    return [text];
  }

  const escaped = escapeRegExp(query);
  const regex = new RegExp(`(${escaped})`, "ig");
  const segments = text.split(regex);

  return segments.map((segment, index) =>
    index % 2 === 1 ? { highlight: segment } : segment
  );
}

export function searchThemes(query: string): ThemeSearchResult[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return themeLibrary.map((entry) => ({
      ...entry,
      matchScore: 0,
      matchedKeywords: [],
    }));
  }

  const normalizedQuery = normalize(trimmed);

  return themeLibrary
    .map((entry) => {
      const normalizedTheme = normalize(entry.theme);
      const normalizedDescription = normalize(entry.description);

      let score = 0;
      const matchedKeywords: string[] = [];

      if (normalizedTheme.includes(normalizedQuery)) {
        score += 5;
      }

      if (normalizedDescription.includes(normalizedQuery)) {
        score += 3;
      }

      entry.keywords.forEach((keyword) => {
        const normalizedKeyword = normalize(keyword);
        if (normalizedKeyword.includes(normalizedQuery) || normalizedQuery.includes(normalizedKeyword)) {
          score += 2;
          matchedKeywords.push(keyword);
        }
      });

      entry.scriptureHighlights.forEach((reference) => {
        const referenceText = `${reference.book} ${reference.chapter}:${reference.verseStart}`;
        if (normalize(referenceText).includes(normalizedQuery)) {
          score += 2;
        }

        if (normalize(reference.summary).includes(normalizedQuery)) {
          score += 1;
        }
      });

      entry.sermonHighlights.forEach((reference) => {
        const sermonText = `${reference.title} ${reference.date}`;
        if (normalize(sermonText).includes(normalizedQuery)) {
          score += 1;
        }

        if (normalize(reference.summary).includes(normalizedQuery)) {
          score += 1;
        }
      });

      return {
        ...entry,
        matchScore: score,
        matchedKeywords,
      } satisfies ThemeSearchResult;
    })
    .filter((result) => result.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || a.theme.localeCompare(b.theme));
}
