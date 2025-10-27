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
      const searchTerm = query.toLowerCase().trim();

      // Strategy 1: Try getBible.net API (most comprehensive)
      try {
        const searchResponse = await fetch(
          `https://getbible.net/v2/kjv/search/${encodeURIComponent(searchTerm)}.json`,
          { signal: AbortSignal.timeout(8000) }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          if (searchData && searchData.verses) {
            for (const verseData of Object.values(searchData.verses) as any[]) {
              if (verseData && verseData.text) {
                allResults.push({
                  book: verseData.book_name || "",
                  chapter: verseData.chapter || 0,
                  verse: verseData.verse || 0,
                  text: verseData.text.replace(/<[^>]*>/g, '').trim(),
                  testament: getTestament(verseData.book_name || ""),
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("getBible.net search failed:", err);
      }

      // If we got good results, return early
      if (allResults.length >= 20) {
        return deduplicateResults(allResults).slice(0, 100);
      }

      // Strategy 2: Try word variations to improve results
      const variations = generateSearchVariations(searchTerm);
      
      for (const variant of variations) {
        if (allResults.length >= 50) break;
        
        try {
          const response = await fetch(
            `https://getbible.net/v2/kjv/search/${encodeURIComponent(variant)}.json`,
            { signal: AbortSignal.timeout(5000) }
          );

          if (response.ok) {
            const data = await response.json();
            
            if (data && data.verses) {
              for (const verseData of Object.values(data.verses) as any[]) {
                if (verseData && verseData.text && allResults.length < 100) {
                  const newResult = {
                    book: verseData.book_name || "",
                    chapter: verseData.chapter || 0,
                    verse: verseData.verse || 0,
                    text: verseData.text.replace(/<[^>]*>/g, '').trim(),
                    testament: getTestament(verseData.book_name || ""),
                  };
                  
                  // Check if verse already exists
                  const exists = allResults.some(r => 
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

      // Strategy 3: Fallback to bible-api.com for verse references
      if (allResults.length === 0) {
        try {
          const verseReferencePattern = /^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/;
          const match = query.match(verseReferencePattern);

          if (match) {
            const response = await fetch(
              `https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`,
              { signal: AbortSignal.timeout(5000) }
            );

            if (response.ok) {
              const data = await response.json();
              
              if (data.verses && Array.isArray(data.verses)) {
                data.verses.forEach((verse: any) => {
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
          console.warn("bible-api.com fallback failed:", err);
        }
      }

      const deduplicated = deduplicateResults(allResults);
      
      if (deduplicated.length === 0) {
        setError(`No results found for "${query}". Try different keywords or a specific verse reference.`);
      }
      
      return deduplicated.slice(0, 100);
    } catch (err) {
      console.error("Bible search error:", err);
      setError("Search failed. Please check your connection and try again.");
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
      const results: WMBSermonResult[] = data.map((row: any) => ({
        sermon_id: row.sermon_id,
        title: row.sermon_title,
        date: new Date(row.sermon_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        location: row.sermon_location,
        excerpt: row.content,
        paragraph: row.paragraph_number,
      }));

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
  const variations = new Set<string>();
  
  // Add base term
  variations.add(term);
  
  // Add common variations
  if (term.length > 3) {
    variations.add(term + 's');           // plural
    variations.add(term.replace(/s$/, '')); // singular
    variations.add(term + 'ing');         // gerund
    variations.add(term + 'ed');          // past tense
    variations.add(term + 'eth');         // KJV style
    variations.add(term + 'd');           // past tense variant
    
    // Remove suffixes to get root
    if (term.endsWith('ing')) {
      variations.add(term.slice(0, -3));
      variations.add(term.slice(0, -3) + 'e');
    }
    if (term.endsWith('ed')) {
      variations.add(term.slice(0, -2));
      variations.add(term.slice(0, -2) + 'e');
    }
  }
  
  return Array.from(variations).filter(v => v.length > 2).slice(0, 10);
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
