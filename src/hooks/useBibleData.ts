import { useState, useEffect } from "react";

export interface BibleVerse {
  number: number;
  text: string;
  isJesusWords?: boolean;
}

export interface BibleBook {
  name: string;
  chapters: number;
  testament: "old" | "new";
}

// Complete KJV Bible structure
export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { name: "Genesis", chapters: 50, testament: "old" },
  { name: "Exodus", chapters: 40, testament: "old" },
  { name: "Leviticus", chapters: 27, testament: "old" },
  { name: "Numbers", chapters: 36, testament: "old" },
  { name: "Deuteronomy", chapters: 34, testament: "old" },
  { name: "Joshua", chapters: 24, testament: "old" },
  { name: "Judges", chapters: 21, testament: "old" },
  { name: "Ruth", chapters: 4, testament: "old" },
  { name: "1 Samuel", chapters: 31, testament: "old" },
  { name: "2 Samuel", chapters: 24, testament: "old" },
  { name: "1 Kings", chapters: 22, testament: "old" },
  { name: "2 Kings", chapters: 25, testament: "old" },
  { name: "1 Chronicles", chapters: 29, testament: "old" },
  { name: "2 Chronicles", chapters: 36, testament: "old" },
  { name: "Ezra", chapters: 10, testament: "old" },
  { name: "Nehemiah", chapters: 13, testament: "old" },
  { name: "Esther", chapters: 10, testament: "old" },
  { name: "Job", chapters: 42, testament: "old" },
  { name: "Psalms", chapters: 150, testament: "old" },
  { name: "Proverbs", chapters: 31, testament: "old" },
  { name: "Ecclesiastes", chapters: 12, testament: "old" },
  { name: "Song of Solomon", chapters: 8, testament: "old" },
  { name: "Isaiah", chapters: 66, testament: "old" },
  { name: "Jeremiah", chapters: 52, testament: "old" },
  { name: "Lamentations", chapters: 5, testament: "old" },
  { name: "Ezekiel", chapters: 48, testament: "old" },
  { name: "Daniel", chapters: 12, testament: "old" },
  { name: "Hosea", chapters: 14, testament: "old" },
  { name: "Joel", chapters: 3, testament: "old" },
  { name: "Amos", chapters: 9, testament: "old" },
  { name: "Obadiah", chapters: 1, testament: "old" },
  { name: "Jonah", chapters: 4, testament: "old" },
  { name: "Micah", chapters: 7, testament: "old" },
  { name: "Nahum", chapters: 3, testament: "old" },
  { name: "Habakkuk", chapters: 3, testament: "old" },
  { name: "Zephaniah", chapters: 3, testament: "old" },
  { name: "Haggai", chapters: 2, testament: "old" },
  { name: "Zechariah", chapters: 14, testament: "old" },
  { name: "Malachi", chapters: 4, testament: "old" },
  // New Testament
  { name: "Matthew", chapters: 28, testament: "new" },
  { name: "Mark", chapters: 16, testament: "new" },
  { name: "Luke", chapters: 24, testament: "new" },
  { name: "John", chapters: 21, testament: "new" },
  { name: "Acts", chapters: 28, testament: "new" },
  { name: "Romans", chapters: 16, testament: "new" },
  { name: "1 Corinthians", chapters: 16, testament: "new" },
  { name: "2 Corinthians", chapters: 13, testament: "new" },
  { name: "Galatians", chapters: 6, testament: "new" },
  { name: "Ephesians", chapters: 6, testament: "new" },
  { name: "Philippians", chapters: 4, testament: "new" },
  { name: "Colossians", chapters: 4, testament: "new" },
  { name: "1 Thessalonians", chapters: 5, testament: "new" },
  { name: "2 Thessalonians", chapters: 3, testament: "new" },
  { name: "1 Timothy", chapters: 6, testament: "new" },
  { name: "2 Timothy", chapters: 4, testament: "new" },
  { name: "Titus", chapters: 3, testament: "new" },
  { name: "Philemon", chapters: 1, testament: "new" },
  { name: "Hebrews", chapters: 13, testament: "new" },
  { name: "James", chapters: 5, testament: "new" },
  { name: "1 Peter", chapters: 5, testament: "new" },
  { name: "2 Peter", chapters: 3, testament: "new" },
  { name: "1 John", chapters: 5, testament: "new" },
  { name: "2 John", chapters: 1, testament: "new" },
  { name: "3 John", chapters: 1, testament: "new" },
  { name: "Jude", chapters: 1, testament: "new" },
  { name: "Revelation", chapters: 22, testament: "new" },
];

export function useBibleData(book: string, chapter: number) {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBibleText = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Using Bible API for KJV
        const bookFormatted = book.replace(/\s+/g, "");
        const response = await fetch(
          `https://bible-api.com/${bookFormatted}${chapter}?translation=kjv`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch Bible text");
        }
        
        const data = await response.json();
        
        // Parse verses from API response
        const parsedVerses: BibleVerse[] = data.verses.map((verse: { verse: number; text: string }) => ({
          number: verse.verse,
          text: verse.text,
          isJesusWords: checkIfJesusWords(book, chapter, verse.verse),
        }));
        
        setVerses(parsedVerses);
      } catch (err) {
        console.error("Error fetching Bible text:", err);
        setError("Failed to load Bible text. Please try again.");
        // Fallback to sample verses
        setVerses(getSampleVerses(book, chapter));
      } finally {
        setLoading(false);
      }
    };

    fetchBibleText();
  }, [book, chapter]);

  return { verses, loading, error };
}

// Helper function to determine if verses are Jesus's words
function checkIfJesusWords(book: string, chapter: number, verse: number): boolean {
  // Major passages where Jesus speaks (this is a simplified list)
  const jesusWordsRanges: Record<string, Record<number, number[]>> = {
    Matthew: {
      5: [3, 48], 6: [1, 34], 7: [1, 29], 11: [28, 30], 13: [3, 52],
      16: [13, 28], 22: [37, 40], 24: [4, 51], 25: [1, 46], 26: [26, 29],
    },
    Mark: {
      1: [15, 17], 4: [9, 41], 8: [34, 38], 10: [14, 45], 13: [5, 37],
    },
    Luke: {
      4: [4, 12], 6: [20, 49], 10: [23, 37], 11: [9, 13], 12: [4, 59],
      15: [4, 32], 22: [15, 20], 24: [38, 49],
    },
    John: {
      3: [3, 21], 4: [7, 26], 5: [19, 47], 6: [26, 71], 8: [12, 58],
      10: [1, 38], 14: [1, 31], 15: [1, 27], 16: [1, 33], 17: [1, 26],
    },
  };

  const bookRanges = jesusWordsRanges[book];
  if (!bookRanges || !bookRanges[chapter]) return false;

  const range = bookRanges[chapter];
  return verse >= range[0] && verse <= range[1];
}

// Fallback sample verses
function getSampleVerses(book: string, chapter: number): BibleVerse[] {
  if (book === "Genesis" && chapter === 1) {
    return [
      { number: 1, text: "In the beginning God created the heaven and the earth." },
      { number: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
      { number: 3, text: "And God said, Let there be light: and there was light." },
    ];
  }
  
  return [
    { number: 1, text: "Loading Bible text from API..." },
  ];
}
