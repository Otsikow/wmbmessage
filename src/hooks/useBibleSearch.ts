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
      // Search using Bible API - this searches across all verses
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`
      );

      if (!response.ok) {
        // If direct verse lookup fails, return empty array
        // In a production app, you'd use a dedicated search API
        return [];
      }

      const data = await response.json();

      // Convert API response to our format
      const results: BibleSearchResult[] = [];
      
      if (data.verses && Array.isArray(data.verses)) {
        data.verses.forEach((verse: any) => {
          results.push({
            book: data.reference.split(" ")[0],
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
            testament: getTestament(data.reference.split(" ")[0]),
          });
        });
      } else if (data.text) {
        // Single verse result
        const bookName = data.reference.split(" ")[0];
        results.push({
          book: bookName,
          chapter: data.verses?.[0]?.chapter || 1,
          verse: data.verses?.[0]?.verse || 1,
          text: data.text,
          testament: getTestament(bookName),
        });
      }

      return results;
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
