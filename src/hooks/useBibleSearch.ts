import { useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { parseVerseReference, type ParsedReference } from "@/lib/verseParser";
import {
  getChapterVerses,
  loadKJVBibleVerses,
  type BibleVerseRecord,
} from "@/utils/bibleData";
import {
  loadSampleSermons,
  SampleSermonRecord,
  formatSermonDate,
} from "@/utils/sampleSermons";

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

const MAX_BIBLE_RESULTS = 1500;
const MAX_SERMON_RESULTS = 500;

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
      const variations = generateSearchVariations(searchTerm);

      // Strategy 1: query Supabase database using direct queries when configured
      if (isSupabaseConfigured) {
        try {
          const { data, error: supabaseError } = await supabase
            .from('bible_verses')
            .select('*')
            .or(`text.ilike.%${normalizedQuery}%,book.ilike.%${normalizedQuery}%`)
            .limit(MAX_BIBLE_RESULTS);

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
      }

      // Strategy 2: Search cached KJV dataset bundled with the app
      const localResults = await searchLocalBibleVerses(query, variations, MAX_BIBLE_RESULTS);
      if (localResults.length > 0) {
        allResults.push(...localResults);
      }

      if (allResults.length >= MAX_BIBLE_RESULTS) {
        return deduplicateResults(allResults).slice(0, MAX_BIBLE_RESULTS);
      }

      // Strategy 3: Try getBible.net API (broad coverage)
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

      // Strategy 4: Try word variations and synonyms to improve results
      for (const variant of variations) {
        if (allResults.length >= MAX_BIBLE_RESULTS) break;

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

      // Strategy 5: Fallback to bible-api.com for verse references
      if (allResults.length === 0) {
        const sampleResults = await searchSampleBibleVerses(normalizedQuery);
        if (sampleResults.length > 0) {
          allResults.push(...sampleResults);
        }

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
      }

      const deduplicated = deduplicateResults(allResults);

      if (deduplicated.length === 0) {
        setError(`No results found for "${query}". Try different keywords or a specific verse reference.`);
      }

      return deduplicated.slice(0, MAX_BIBLE_RESULTS);
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
      
      // Search sermons and their paragraphs when Supabase is available
      let results: WMBSermonResult[] = [];

      if (isSupabaseConfigured) {
        const { data: sermonData, error: searchError } = await supabase
          .from('sermons')
          .select(`
            id,
            title,
            date,
            location,
            sermon_paragraphs (
              paragraph_number,
              content
            )
          `);

        if (searchError) {
          console.error("Sermon search error:", searchError);
          setError("Failed to search sermons");
        }

        if (Array.isArray(sermonData)) {
          sermonData.forEach((sermon: any) => {
            const paragraphs = sermon.sermon_paragraphs || [];
            const titleMatches = sermon.title?.toLowerCase().includes(searchTerm);
            const locationMatches = sermon.location?.toLowerCase().includes(searchTerm);
            paragraphs.forEach((para: any) => {
              const paragraphMatches = para.content?.toLowerCase().includes(searchTerm);
              if (paragraphMatches || titleMatches || locationMatches) {
                const formattedDate = formatSermonDate(sermon.date);

                results.push({
                  sermon_id: sermon.id,
                  title: sermon.title,
                  date: formattedDate,
                  location: sermon.location,
                  excerpt: para.content,
                  paragraph: para.paragraph_number,
                });
              }
            });
          });
        }
      }

      if (results.length === 0) {
        const sampleResults = await searchSampleSermons(searchTerm);
        results = sampleResults;
      }

      return results.slice(0, MAX_SERMON_RESULTS);
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

async function searchLocalBibleVerses(
  query: string,
  variations: string[],
  limit = 200
): Promise<BibleSearchResult[]> {
  const cleanedQuery = sanitizeSearchQuery(query).toLowerCase();
  if (!cleanedQuery) return [];

  try {
    const dataset = await loadKJVBibleVerses();
    if (!dataset.length) return [];

    const words = cleanedQuery.split(/\s+/).filter(Boolean);
    const tokenSet = new Set<string>();
    variations.forEach((variant) => {
      const cleaned = sanitizeSearchQuery(variant).toLowerCase();
      if (cleaned) tokenSet.add(cleaned);
    });
    words.forEach((word) => tokenSet.add(word));
    if (cleanedQuery.length > 2) {
      tokenSet.add(cleanedQuery);
    }

    const results: BibleSearchResult[] = [];
    const seenKeys = new Set<string>();

    const parsedReference = parseVerseReference(query);
    if (parsedReference) {
      const referenceVerses = await getVersesForReference(parsedReference);
      for (const record of referenceVerses) {
        const key = buildResultKey(record);
        if (seenKeys.has(key)) continue;
        results.push(convertRecordToResult(record));
        seenKeys.add(key);
        if (results.length >= limit) {
          return results;
        }
      }
    }

    for (const verse of dataset) {
      if (results.length >= limit) break;

      const key = buildResultKey(verse);
      if (seenKeys.has(key)) continue;

      const verseLower = verse.text.toLowerCase();
      const tokens = Array.from(tokenSet).filter((token) => token.length > 2);
      const matchesWords =
        tokens.length === 0
          ? false
          : tokens.some((token) => verseLower.includes(token));

      if (!matchesWords) continue;

      results.push(convertRecordToResult(verse));
      seenKeys.add(key);
    }

    return results;
  } catch (error) {
    console.warn('Local Bible search failed:', error);
    return [];
  }
}

function convertRecordToResult(record: BibleVerseRecord): BibleSearchResult {
  return {
    book: record.book,
    chapter: record.chapter,
    verse: record.verse,
    text: record.text,
    testament: getTestament(record.book),
  };
}

async function getVersesForReference(ref: ParsedReference): Promise<BibleVerseRecord[]> {
  const verses = await getChapterVerses(ref.book, ref.chapter);
  if (!ref.startVerse) {
    return verses;
  }

  const endVerse = ref.endVerse ?? ref.startVerse;
  return verses.filter((verse) => verse.verse >= ref.startVerse! && verse.verse <= endVerse);
}

function buildResultKey(record: BibleVerseRecord): string {
  return `${record.book}-${record.chapter}-${record.verse}`;
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

let cachedSampleBibleVerses: SupabaseBibleVerseRow[] | null = null;

async function loadSampleBibleVerses(): Promise<SupabaseBibleVerseRow[]> {
  if (cachedSampleBibleVerses) {
    return cachedSampleBibleVerses;
  }

  try {
    const response = await fetch('/sample-data/bible-verses-sample.json');
    if (!response.ok) {
      throw new Error('Failed to load sample Bible verses');
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Sample Bible verses malformed');
    }

    cachedSampleBibleVerses = data
      .map(normalizeSupabaseBibleVerseRow)
      .filter((row): row is SupabaseBibleVerseRow => row !== null);
  } catch (err) {
    console.warn('Unable to load sample Bible verses:', err);
    cachedSampleBibleVerses = [];
  }

  return cachedSampleBibleVerses;
}

async function searchSampleBibleVerses(query: string): Promise<BibleSearchResult[]> {
  const lowerQuery = query.toLowerCase();
  const sampleVerses = await loadSampleBibleVerses();

  return sampleVerses
    .filter((verse) =>
      verse.text.toLowerCase().includes(lowerQuery) ||
      verse.book.toLowerCase().includes(lowerQuery)
    )
    .map((verse) => ({
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text.trim(),
      testament: getTestament(verse.book),
    }));
}

async function searchSampleSermons(searchTerm: string): Promise<WMBSermonResult[]> {
  const lowerQuery = searchTerm.toLowerCase();
  const sampleSermons = await loadSampleSermons();
  const results: WMBSermonResult[] = [];

  sampleSermons.forEach((sermon, sermonIndex) => {
    sermon.paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraph.toLowerCase().includes(lowerQuery)) {
        const themes =
          sermon.themes && sermon.themes.length > 0 ? [...sermon.themes] : undefined;
        const bibleReferences =
          sermon.references && sermon.references.length > 0
            ? [...sermon.references]
            : undefined;
        const year = sermon.date ? new Date(sermon.date).getFullYear() : undefined;

        results.push({
          sermon_id: `${sermon.title}-${sermonIndex}`,
          title: sermon.title,
          date: formatSermonDate(sermon.date),
          location: sermon.location || 'Unknown Location',
          excerpt: paragraph,
          paragraph: paragraphIndex + 1,
          year,
          themes,
          bibleReferences,
        });
      }
    });
  });

  return results;
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
