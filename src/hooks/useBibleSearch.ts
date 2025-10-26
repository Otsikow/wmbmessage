import { useState, useCallback } from "react";

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  testament: "OT" | "NT";
}

export interface WMBSermonResult {
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

      // For keyword searches, use getBible.net API which supports text search
      const searchResponse = await fetch(
        `https://getbible.net/v2/kjv/search/${encodeURIComponent(query)}.json`
      );

      if (!searchResponse.ok) {
        return [];
      }

      const searchData = await searchResponse.json();
      const results: BibleSearchResult[] = [];

      // Process search results from getBible.net
      if (searchData && searchData.verses) {
        for (const verseData of Object.values(searchData.verses) as any[]) {
          if (verseData && verseData.verse) {
            const verse = verseData.verse;
            results.push({
              book: verseData.book_name || "",
              chapter: verseData.chapter || 0,
              verse: verseData.verse || 0,
              text: verseData.text || verse,
              testament: getTestament(verseData.book_name || ""),
            });
          }
        }
      }

      // Limit results to avoid overwhelming the UI
      return results.slice(0, 100);
    } catch (err) {
      console.error("Bible search error:", err);
      setError("Failed to search Bible");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchWMBSermons = useCallback(async (query: string): Promise<WMBSermonResult[]> => {
    // Mock WMB sermon search - in production, this would connect to a real API
    const mockSermons: WMBSermonResult[] = [
      {
        title: "The Spoken Word is the Original Seed",
        date: "March 18, 1962",
        location: "Jeffersonville, IN",
        excerpt: "God's Word is the original seed. Any seed will bring forth after its kind...",
        paragraph: 45,
      },
      {
        title: "Christ is the Mystery of God Revealed",
        date: "July 28, 1963",
        location: "Jeffersonville, IN",
        excerpt: "Christ is God's mystery revealed to His people in this last day...",
        paragraph: 12,
      },
      {
        title: "The Seven Church Ages",
        date: "December 1960",
        location: "Jeffersonville, IN",
        excerpt: "The seven church ages represent the complete history of the church...",
        paragraph: 8,
      },
      {
        title: "The Rapture",
        date: "December 4, 1965",
        location: "Yuma, AZ",
        excerpt: "The church is waiting for the rapture, the coming of the Lord...",
        paragraph: 23,
      },
      {
        title: "The Greatest Battle Ever Fought",
        date: "March 11, 1962",
        location: "Jeffersonville, IN",
        excerpt: "The battle between God and Satan, between light and darkness...",
        paragraph: 67,
      },
    ];

    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return mockSermons.filter(
      (sermon) =>
        sermon.title.toLowerCase().includes(lowerQuery) ||
        sermon.excerpt.toLowerCase().includes(lowerQuery) ||
        sermon.location.toLowerCase().includes(lowerQuery)
    );
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
