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
      // Try to parse as a specific verse reference first (e.g., "John 3:16")
      const verseReferencePattern = /^(\d?\s?[A-Za-z]+)\s*(\d+)(?::(\d+))?(?:-(\d+))?$/;
      const match = query.match(verseReferencePattern);

      if (match) {
        // If it's a specific verse reference, use bible-api.com
        const response = await fetch(
          `https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`
        );

        if (response.ok) {
          const data = await response.json();
          const results: BibleSearchResult[] = [];
          
          if (data.verses && Array.isArray(data.verses)) {
            data.verses.forEach((verse: any) => {
              results.push({
                book: data.reference.split(/\d/)[0].trim(),
                chapter: verse.chapter,
                verse: verse.verse,
                text: verse.text,
                testament: getTestament(data.reference.split(/\d/)[0].trim()),
              });
            });
          } else if (data.text) {
            const bookName = data.reference.split(/\d/)[0].trim();
            results.push({
              book: bookName,
              chapter: data.verses?.[0]?.chapter || 1,
              verse: data.verses?.[0]?.verse || 1,
              text: data.text,
              testament: getTestament(bookName),
            });
          }

          if (results.length > 0) {
            return results;
          }
        }
      }

      // For keyword searches, use getBible.net API with multiple search strategies
      const allResults: BibleSearchResult[] = [];
      const searchTerm = query.toLowerCase().trim();
      
      // Try exact search first
      try {
        const searchResponse = await fetch(
          `https://getbible.net/v2/kjv/search/${encodeURIComponent(searchTerm)}.json`
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          if (searchData && searchData.verses) {
            for (const verseData of Object.values(searchData.verses) as any[]) {
              if (verseData) {
                allResults.push({
                  book: verseData.book_name || "",
                  chapter: verseData.chapter || 0,
                  verse: verseData.verse || 0,
                  text: verseData.text || "",
                  testament: getTestament(verseData.book_name || ""),
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Primary search error:", err);
      }

      // If we have enough results, return them
      if (allResults.length >= 20) {
        return allResults.slice(0, 100);
      }

      // Try word variations to get more results
      const variations = [
        searchTerm + 's',           // plural
        searchTerm.replace(/s$/, ''), // singular
        searchTerm + 'ing',          // gerund
        searchTerm + 'ed',           // past tense
        searchTerm + 'eth',          // KJV style
      ];

      for (const variant of variations) {
        if (allResults.length >= 50) break;
        
        try {
          const response = await fetch(
            `https://getbible.net/v2/kjv/search/${encodeURIComponent(variant)}.json`
          );

          if (response.ok) {
            const data = await response.json();
            
            if (data && data.verses) {
              for (const verseData of Object.values(data.verses) as any[]) {
                if (verseData && allResults.length < 100) {
                  // Check if verse already exists
                  const exists = allResults.some(r => 
                    r.book === verseData.book_name && 
                    r.chapter === verseData.chapter && 
                    r.verse === verseData.verse
                  );
                  
                  if (!exists) {
                    allResults.push({
                      book: verseData.book_name || "",
                      chapter: verseData.chapter || 0,
                      verse: verseData.verse || 0,
                      text: verseData.text || "",
                      testament: getTestament(verseData.book_name || ""),
                    });
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error(`Variant search error for ${variant}:`, err);
        }
      }

      return allResults.slice(0, 100);
    } catch (err) {
      console.error("Bible search error:", err);
      setError("Failed to search Bible");
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
