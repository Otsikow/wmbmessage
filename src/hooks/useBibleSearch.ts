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

// Remove artificial limits - return ALL matching results
const MAX_BIBLE_RESULTS = 10000;
const MAX_SERMON_RESULTS = 5000;

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
      const searchProfile = buildSearchProfile(normalizedQuery);

      // Create comprehensive search terms set
      const searchTerms = searchProfile.searchTerms;

      // PRIORITY STRATEGY: Search cached KJV dataset first (complete Bible, ~31,000 verses)
      // This is the most reliable source
      const localResults = await searchLocalBibleVerses(query, searchProfile, MAX_BIBLE_RESULTS);
      if (localResults.length > 0) {
        allResults.push(...localResults);
        console.log(`[Search] Found ${localResults.length} results from local KJV dataset`);
      }

      // Strategy 2: Query Supabase database for any additional verses
      if (isSupabaseConfigured && allResults.length < MAX_BIBLE_RESULTS) {
        try {
          // Build OR conditions for all search variations
          const orConditions = Array.from(searchTerms)
            .slice(0, 8) // Limit to prevent query size issues
            .map(term => `text.ilike.%${term}%`)
            .join(',');
          
          const { data, error: supabaseError } = await supabase
            .from('bible_verses')
            .select('*')
            .or(orConditions)
            .limit(MAX_BIBLE_RESULTS);

          if (supabaseError) {
            console.warn('Supabase Bible search failed:', supabaseError);
          } else if (Array.isArray(data) && data.length > 0) {
            console.log(`[Search] Found ${data.length} results from Supabase`);
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

      // Strategy 3: Try getBible.net API for supplementary results
      if (allResults.length < 100) {
        try {
          const searchResponse = await fetch(
            `https://getbible.net/v2/kjv/search/${encodeURIComponent(searchProfile.normalizedQuery)}.json`,
            { signal: AbortSignal.timeout(8000) }
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();

            if (searchData && searchData.verses) {
              const apiResults = Object.values(searchData.verses) as BibleVerseData[];
              console.log(`[Search] Found ${apiResults.length} results from getBible.net API`);
              
              for (const verseData of apiResults) {
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
      }

      // Strategy 4: Fallback to sample verses for verse references
      if (allResults.length === 0) {
        const sampleResults = await searchSampleBibleVerses(normalizedQuery);
        if (sampleResults.length > 0) {
          allResults.push(...sampleResults);
        }

        // Try bible-api.com for specific verse references
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
      console.log(`[Search] Total deduplicated results for "${query}": ${deduplicated.length}`);

      if (deduplicated.length === 0) {
        setError(`No results found for "${query}". Try different keywords or a specific verse reference.`);
      }

      return deduplicated;
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
      const searchProfile = buildSearchProfile(query);
      
      // Search sermons and their paragraphs when Supabase is available
      let results: WMBSermonResult[] = [];

      if (isSupabaseConfigured) {
        // Fetch ALL sermons and paragraphs - no limit
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
          `)
          .order('date', { ascending: false });

        if (searchError) {
          console.error("Sermon search error:", searchError);
          setError("Failed to search sermons");
        }

        if (Array.isArray(sermonData)) {
          // Create a set of all search terms including variations
          sermonData.forEach((sermon: any) => {
            const paragraphs = sermon.sermon_paragraphs || [];
            const titleLower = sermon.title?.toLowerCase() || '';
            const locationLower = sermon.location?.toLowerCase() || '';
            
            paragraphs.forEach((para: any) => {
              const contentLower = para.content?.toLowerCase() || '';
              const contentScore = getMatchScore(contentLower, searchProfile);
              const titleScore = getMatchScore(titleLower, searchProfile);
              const locationScore = getMatchScore(locationLower, searchProfile);
              const matches = Math.max(contentScore, titleScore, locationScore) > 0;
              
              if (matches) {
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

      // Also search sample sermons as fallback/supplement
      const sampleResults = await searchSampleSermons(searchProfile);
      
      // Deduplicate by sermon_id + paragraph
      const seen = new Set<string>();
      const allResults = [...results, ...sampleResults].filter(result => {
        const key = `${result.sermon_id}-${result.paragraph}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return allResults.slice(0, MAX_SERMON_RESULTS);
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
  searchProfile: SearchProfile,
  limit = 10000
): Promise<BibleSearchResult[]> {
  const cleanedQuery = searchProfile.normalizedQuery;
  if (!cleanedQuery) return [];

  try {
    const dataset = await loadKJVBibleVerses();
    if (!dataset.length) return [];

    const results: BibleSearchResult[] = [];
    const seenKeys = new Set<string>();
    const scoredMatches: Array<{ score: number; order: number; result: BibleSearchResult }> =
      [];

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

    let order = 0;
    for (const verse of dataset) {
      if (results.length + scoredMatches.length >= limit) break;

      const key = buildResultKey(verse);
      if (seenKeys.has(key)) continue;

      const score = getMatchScore(verse.text, searchProfile);
      if (score <= 0) {
        order += 1;
        continue;
      }

      const result = convertRecordToResult(verse);
      scoredMatches.push({ score, order, result });
      seenKeys.add(key);
      order += 1;
    }

    scoredMatches
      .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.order - b.order))
      .forEach(({ result }) => {
        if (results.length >= limit) return;
        results.push(result);
      });

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

type SearchProfile = {
  normalizedQuery: string;
  tokens: string[];
  coreTokens: string[];
  tokenVariations: Map<string, string[]>;
  searchTerms: Set<string>;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "of",
  "to",
  "in",
  "for",
  "on",
  "with",
  "by",
  "at",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
]);

const SEARCH_SYNONYMS: Record<string, string[]> = {
  love: ["loveth", "loving", "beloved", "charity", "loves", "loved"],
  faith: ["faithful", "faithfulness", "belief", "believe", "believeth"],
  hope: ["hopeful", "hoped", "expectation"],
  grace: ["favour", "favor", "gracious"],
  prayer: ["pray", "prayed", "praying"],
  pray: ["prayer", "prayed", "praying"],
  mercy: ["merciful", "mercies"],
  peace: ["peaceful", "shalom"],
  joy: ["joyful", "rejoice", "rejoiced", "gladness"],
  believe: ["believeth", "believes", "believed"],
  spirit: ["ghost", "holy ghost", "holy spirit"],
  lord: ["god", "jehovah"],
  jesus: ["christ", "messiah"],
};

function buildSearchProfile(query: string): SearchProfile {
  const normalizedQuery = sanitizeSearchQuery(query).toLowerCase();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const coreTokens = tokens.filter((token) => !STOP_WORDS.has(token));
  const finalTokens = coreTokens.length > 0 ? coreTokens : tokens;

  const tokenVariations = new Map<string, string[]>();
  const searchTerms = new Set<string>();

  if (normalizedQuery.length > 2) {
    searchTerms.add(normalizedQuery);
  }

  finalTokens.forEach((token) => {
    const variations = buildTokenVariations(token);
    tokenVariations.set(token, variations);
    variations.forEach((variant) => searchTerms.add(variant));
  });

  if (finalTokens.length > 1) {
    searchTerms.add(finalTokens.join(" "));
  }

  return {
    normalizedQuery,
    tokens,
    coreTokens: finalTokens,
    tokenVariations,
    searchTerms,
  };
}

function buildTokenVariations(token: string): string[] {
  if (token.length <= 2) return [];

  const variations = new Set<string>([token]);

  variations.add(token.replace(/s$/, ""));
  variations.add(`${token}s`);
  variations.add(`${token}ing`);
  variations.add(`${token}ed`);
  variations.add(`${token}eth`);
  variations.add(`${token}est`);
  variations.add(`${token}ly`);
  variations.add(`${token}ness`);

  if (token.endsWith("ing")) {
    variations.add(token.slice(0, -3));
    variations.add(token.slice(0, -3) + "e");
  }
  if (token.endsWith("ed")) {
    variations.add(token.slice(0, -2));
    variations.add(token.slice(0, -2) + "e");
  }
  if (token.endsWith("y")) {
    variations.add(token.slice(0, -1) + "ies");
  }

  SEARCH_SYNONYMS[token]?.forEach((syn) => variations.add(syn));

  return Array.from(variations).filter((variant) => variant.length > 2);
}

function getMatchScore(text: string, profile: SearchProfile): number {
  const normalizedText = sanitizeSearchQuery(text).toLowerCase();
  if (!normalizedText) return 0;

  const words = normalizedText.split(/\s+/).filter(Boolean);
  const wordSet = new Set(words);
  let score = 0;

  if (profile.normalizedQuery.length > 2 && normalizedText.includes(profile.normalizedQuery)) {
    score += 6;
  }

  let matchedTokens = 0;
  profile.coreTokens.forEach((token) => {
    const variations = profile.tokenVariations.get(token) ?? [token];
    const tokenMatch = variations.some((variant) => {
      if (wordSet.has(variant)) return true;
      if (variant.length > 4) {
        return words.some((word) => word.startsWith(variant));
      }
      return normalizedText.includes(variant);
    });
    if (tokenMatch) {
      matchedTokens += 1;
      score += 2;
    }
  });

  if (matchedTokens > 0 && matchedTokens === profile.coreTokens.length) {
    score += 4;
  }

  const variationMatches = Array.from(profile.searchTerms).filter(
    (term) => term.length > 2 && normalizedText.includes(term),
  ).length;
  score += Math.min(variationMatches, 6);

  return score;
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
  const searchProfile = buildSearchProfile(query);
  const sampleVerses = await loadSampleBibleVerses();

  return sampleVerses
    .filter((verse) => getMatchScore(verse.text, searchProfile) > 0)
    .map((verse) => ({
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text.trim(),
      testament: getTestament(verse.book),
    }));
}

async function searchSampleSermons(
  searchProfile: SearchProfile
): Promise<WMBSermonResult[]> {
  const sampleSermons = await loadSampleSermons();
  const results: WMBSermonResult[] = [];

  sampleSermons.forEach((sermon, sermonIndex) => {
    sermon.paragraphs.forEach((paragraph, paragraphIndex) => {
      const paragraphScore = getMatchScore(paragraph, searchProfile);
      const titleScore = getMatchScore(sermon.title, searchProfile);
      const locationScore = getMatchScore(sermon.location || "", searchProfile);
      if (Math.max(paragraphScore, titleScore, locationScore) > 0) {
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
