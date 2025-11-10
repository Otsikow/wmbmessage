import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  testament: "OT" | "NT";
}

export interface WMBSermonResult {
  sermon_id: string;
  title: string;
  date: string;
  location: string;
  excerpt: string;
  paragraph: number;
  year?: number;
  themes?: string[];
  bibleReferences?: string[];
}

interface BibleVerseData {
  book_name?: string;
  chapter?: number;
  verse?: number;
  text?: string;
}

interface SupabaseBibleVerseRow {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export function useBibleSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBible = useCallback(async (query: string): Promise<BibleSearchResult[]> => {
    if (!query.trim()) return [];

    setLoading(true);
    setError(null);

    try {
      const allResults: BibleSearchResult[] = [];
      const normalizedQuery = query.trim();
      const searchTerm = normalizedQuery.toLowerCase();

      // Strategy 1: query Supabase full-text search (preferred source)
      try {
        const sanitizedQuery = sanitizeSearchQuery(normalizedQuery);
        const { data, error: supabaseError } = await supabase.rpc('search_bible_verses', {
          search_query: sanitizedQuery,
          result_limit: 75,
        });

        if (supabaseError) {
          console.warn('Supabase Bible search failed:', supabaseError);
        } else if (Array.isArray(data)) {
          data
            .map(normalizeSupabaseBibleVerseRow)
            .filter((row): row is SupabaseBibleVerseRow => row !== null)
            .forEach((row) => {
              allResults.push({
                book: row.book,
                chapter: row.chapter,
                verse: row.verse,
                text: row.text.trim(),
                testament: getTestament(row.book),
              });
            });
        }
      } catch (err) {
        console.warn('Supabase Bible search request failed:', err);
      }

      if (allResults.length >= 20) {
        return deduplicateResults(allResults).slice(0, 100);
      }

      // Strategy 2: Try getBible.net API (broad coverage)
      try {
        const searchResponse = await fetch(
          `https://getbible.net/v2/kjv/search/${encodeURIComponent(searchTerm)}.json`,
          { signal: AbortSignal.timeout(8000) }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          if (searchData && searchData.verses) {
            for (const verseData of Object.values(searchData.verses) as BibleVerseData[]) {
              if (verseData && verseData.text) {
                allResults.push({
                  book: verseData.book_name || '',
                  chapter: verseData.chapter || 0,
                  verse: verseData.verse || 0,
                  text: verseData.text.replace(/<[^>]*>/g, '').trim(),
                  testament: getTestament(verseData.book_name || ''),
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('getBible.net search failed:', err);
      }

      if (allResults.length >= 50) {
        return deduplicateResults(allResults).slice(0, 100);
      }

      // Strategy 3: Try word variations and synonyms to improve results
      const variations = generateSearchVariations(searchTerm);

      for (const variant of variations) {
        if (allResults.length >= 100) break;

        try {
          const response = await fetch(
            `https://getbible.net/v2/kjv/search/${encodeURIComponent(variant)}.json`,
            { signal: AbortSignal.timeout(5000) }
          );

          if (response.ok) {
            const data = await response.json();

            if (data && data.verses) {
              for (const verseData of Object.values(data.verses) as BibleVerseData[]) {
                if (verseData && verseData.text) {
                  const newResult = {
                    book: verseData.book_name || '',
                    chapter: verseData.chapter || 0,
                    verse: verseData.verse || 0,
                    text: verseData.text.replace(/<[^>]*>/g, '').trim(),
                    testament: getTestament(verseData.book_name || ''),
                  };

                  const exists = allResults.some(
                    (r) =>
                      r.book === newResult.book &&
                      r.chapter === newResult.chapter &&
                      r.verse === newResult.verse
                  );

                  if (!exists) {
                    allResults.push(newResult);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn(`Variant search failed for ${variant}:`, err);
        }
      }

      // Strategy 4: Fallback to bible-api.com for verse references
      if (allResults.length === 0) {
        try {
          const verseReferencePattern = /^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/;
          const match = normalizedQuery.match(verseReferencePattern);

          if (match) {
            const response = await fetch(
              `https://bible-api.com/${encodeURIComponent(normalizedQuery)}?translation=kjv`,
              { signal: AbortSignal.timeout(5000) }
            );

            if (response.ok) {
              const data = await response.json();

              if (data.verses && Array.isArray(data.verses)) {
                data.verses.forEach((verse: { chapter: number; verse: number; text: string }) => {
                  allResults.push({
                    book: data.reference.split(/\d/)[0].trim(),
                    chapter: verse.chapter,
                    verse: verse.verse,
                    text: verse.text.trim(),
                    testament: getTestament(data.reference.split(/\d/)[0].trim()),
                  });
                });
              } else if (data.text) {
                const bookName = data.reference.split(/\d/)[0].trim();
                allResults.push({
                  book: bookName,
                  chapter: data.verses?.[0]?.chapter || 1,
                  verse: data.verses?.[0]?.verse || 1,
                  text: data.text.trim(),
                  testament: getTestament(bookName),
                });
              }
            }
          }
        } catch (err) {
          console.warn('bible-api.com fallback failed:', err);
        }
      }

      const deduplicated = deduplicateResults(allResults);

      if (deduplicated.length === 0) {
        setError(`No results found for "${query}". Try different keywords or a specific verse reference.`);
      }

      return deduplicated.slice(0, 100);
    } catch (err) {
      console.error('Bible search error:', err);
      setError('Search failed. Please check your connection and try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchWMBSermons = useCallback(async (query: string): Promise<WMBSermonResult[]> => {
    if (!query.trim()) return [];

    setLoading(true);
    setError(null);

    try {
      const searchTerm = query.toLowerCase().trim();
      
      // Search using the database function for full-text search
      const { data, error: searchError } = await supabase.rpc('search_sermon_content', {
        search_query: searchTerm,
        result_limit: 50
      });

      if (searchError) {
        console.error("Sermon search error:", searchError);
        setError("Failed to search sermons");
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transform the results to match the expected format
      const results: WMBSermonResult[] = (data as any[]).map((row: any) => {
        const rawDate = row.sermon_date ? new Date(row.sermon_date) : null;
        const formattedDate = rawDate
          ? rawDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : row.sermon_date ?? 'Unknown date';

        const themeTags: string[] = Array.isArray(row.themes)
          ? row.themes
          : Array.isArray(row.theme_tags)
            ? row.theme_tags
            : [];

        const bibleReferences: string[] = Array.isArray(row.bible_references)
          ? row.bible_references
          : [];

        return {
          sermon_id: row.sermon_id,
          title: row.sermon_title,
          date: formattedDate,
          location: row.sermon_location,
          excerpt: row.content,
          paragraph: row.paragraph_number,
          year: rawDate?.getFullYear(),
          themes: themeTags,
          bibleReferences,
        } satisfies WMBSermonResult;
      });

      return results;
    } catch (err) {
      console.error("Sermon search error:", err);
      setError("Failed to search sermons");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchBible,
    searchWMBSermons,
    loading,
    error,
  };
}

function getTestament(bookName: string): "OT" | "NT" {
  const ntBooks = [
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
    "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
    "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
    "Jude", "Revelation"
  ];
  
  return ntBooks.includes(bookName) ? "NT" : "OT";
}

function generateSearchVariations(term: string): string[] {
  const cleaned = sanitizeSearchQuery(term.toLowerCase());
  if (!cleaned) return [];

  const variations = new Set<string>();
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const synonyms: Record<string, string[]> = {
    love: ['loveth', 'loving', 'beloved', 'charity', 'loves', 'loved'],
    faith: ['faithful', 'faithfulness', 'belief', 'believe', 'believeth'],
    hope: ['hopeful', 'hoped', 'expectation'],
    grace: ['favour', 'favor', 'gracious'],
    prayer: ['pray', 'prayed', 'praying'],
    pray: ['prayer', 'prayed', 'praying'],
    mercy: ['merciful', 'mercies'],
    peace: ['peaceful', 'shalom'],
    joy: ['joyful', 'rejoice', 'rejoiced', 'gladness'],
    believe: ['believeth', 'believes', 'believed'],
  };

  const addVariantsForToken = (token: string) => {
    if (token.length <= 2) return;

    variations.add(token);

    variations.add(token.replace(/s$/, ''));
    variations.add(`${token}s`);
    variations.add(`${token}ing`);
    variations.add(`${token}ed`);
    variations.add(`${token}eth`);
    variations.add(`${token}est`);

    if (token.endsWith('ing')) {
      variations.add(token.slice(0, -3));
      variations.add(token.slice(0, -3) + 'e');
    }
    if (token.endsWith('ed')) {
      variations.add(token.slice(0, -2));
      variations.add(token.slice(0, -2) + 'e');
    }

    synonyms[token]?.forEach((syn) => variations.add(syn));
  };

  if (tokens.length === 1) {
    addVariantsForToken(tokens[0]);
  } else {
    tokens.forEach(addVariantsForToken);
    variations.add(tokens.join(' '));
  }

  return Array.from(variations).filter((v) => v && v.length > 2).slice(0, 15);
}

function sanitizeSearchQuery(query: string): string {
  return query
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function deduplicateResults(results: BibleSearchResult[]): BibleSearchResult[] {
  const seen = new Set<string>();
  return results.filter(result => {
    const key = `${result.book}-${result.chapter}-${result.verse}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeSupabaseBibleVerseRow(value: unknown): SupabaseBibleVerseRow | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const book = typeof record.book === 'string' ? record.book : null;
  const text = typeof record.text === 'string' ? record.text : null;
  const chapterRaw = record.chapter;
  const verseRaw = record.verse;

  const chapter = typeof chapterRaw === 'number' ? chapterRaw : Number(chapterRaw);
  const verse = typeof verseRaw === 'number' ? verseRaw : Number(verseRaw);

  if (!book || !text || !Number.isFinite(chapter) || !Number.isFinite(verse)) {
    return null;
  }

  return {
    book,
    text,
    chapter,
    verse,
  };
}
