import { BIBLE_BOOKS } from "@/hooks/useBibleData";

export interface ParsedReference {
  book: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
}

export function parseVerseReference(reference: string): ParsedReference | null {
  // Clean up the reference
  const cleaned = reference.trim();
  
  // Match patterns like "John 3:16", "Genesis 1:1-3", "Romans 8:28"
  const pattern = /^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/;
  const match = cleaned.match(pattern);
  
  if (!match) return null;
  
  const bookName = match[1].trim();
  const chapter = parseInt(match[2]);
  const startVerse = match[3] ? parseInt(match[3]) : undefined;
  const endVerse = match[4] ? parseInt(match[4]) : undefined;
  
  // Find the book (case-insensitive, partial match)
  const book = BIBLE_BOOKS.find(b => 
    b.name.toLowerCase().includes(bookName.toLowerCase()) ||
    bookName.toLowerCase().includes(b.name.toLowerCase())
  );
  
  if (!book) return null;
  
  return {
    book: book.name,
    chapter,
    startVerse,
    endVerse
  };
}

export function formatReference(ref: ParsedReference): string {
  let formatted = `${ref.book} ${ref.chapter}`;
  if (ref.startVerse) {
    formatted += `:${ref.startVerse}`;
    if (ref.endVerse && ref.endVerse !== ref.startVerse) {
      formatted += `-${ref.endVerse}`;
    }
  }
  return formatted;
}
